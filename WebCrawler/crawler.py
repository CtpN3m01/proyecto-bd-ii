import requests
from bs4 import BeautifulSoup
import re
import csv
import json
import time
import os
from urllib.parse import urljoin, urlparse, unquote
from collections import defaultdict, Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pandas as pd
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WikipediaCrawler:
    def __init__(self, max_depth=3, max_pages=1000, delay=1):
        """
        Inicializar el crawler de Wikipedia
        
        Args:
            max_depth: Profundidad máxima de navegación recursiva
            max_pages: Número máximo de páginas a procesar
            delay: Tiempo de espera entre requests (en segundos)
        """
        self.base_url = "https://es.wikipedia.org"
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.delay = delay
        self.visited_urls = set()
        self.crawled_data = []
        
        # Configurar headers para evitar ser bloqueado
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
          # Descargar recursos de NLTK si no están disponibles
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        try:
            nltk.data.find('tokenizers/punkt_tab')
        except LookupError:
            nltk.download('punkt_tab')
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        
        # Configurar stopwords en español
        self.stop_words = set(stopwords.words('spanish'))
        # Agregar más stopwords comunes
        self.stop_words.update(['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 
                               'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 
                               'para', 'al', 'del', 'los', 'las', 'una', 'como', 'más'])
        
        # Crear directorio de datos si no existe (en la carpeta del crawler)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(script_dir, 'data')
        os.makedirs(self.data_dir, exist_ok=True)
    
    def clean_text(self, text):
        """Limpiar y normalizar texto"""
        if not text:
            return ""
        
        # Remover caracteres especiales y números
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\d+', '', text)
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip().lower()
    
    def extract_words(self, text):
        """Extraer palabras limpias del texto"""
        clean_text = self.clean_text(text)
        
        # Tokenizar
        words = word_tokenize(clean_text, language='spanish')
          # Filtrar stopwords y palabras muy cortas, pero ser menos restrictivo
        words = [word for word in words if word not in self.stop_words and len(word) > 1]  # Cambio de >2 a >1
        
        return words
    
    def generate_ngrams(self, words, n):
        """Generar n-gramas de una lista de palabras"""
        if len(words) < n:
            return []
        
        ngrams = []
        for i in range(len(words) - n + 1):
            ngram = ' '.join(words[i:i+n])
            ngrams.append(ngram)
        
        return ngrams
    
    def get_page_revisions(self, title):
        """Obtener información de ediciones de una página usando la API de Wikipedia"""
        try:
            # URL de la API para obtener revisiones
            api_url = f"{self.base_url}/w/api.php"
            params = {
                'action': 'query',
                'format': 'json',
                'titles': title,
                'prop': 'revisions',
                'rvlimit': 'max',
                'rvprop': 'timestamp'
            }
            
            response = requests.get(api_url, params=params, headers=self.headers, timeout=10)
            data = response.json()
            
            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for page_id, page_data in pages.items():
                    if 'revisions' in page_data:
                        revisions = page_data['revisions']
                        # Contar ediciones por día
                        revision_dates = [rev['timestamp'][:10] for rev in revisions]
                        daily_edits = Counter(revision_dates)
                        return dict(daily_edits)
            
            return {}
        except Exception as e:
            logger.warning(f"Error obteniendo revisiones para {title}: {e}")
            return {}
    
    def extract_links(self, soup, current_url):
        """Extraer enlaces válidos de Wikipedia de la página"""
        links = []
        
        # Buscar todos los enlaces
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            
            # Filtrar solo enlaces a otras páginas de Wikipedia
            if href and href.startswith('/wiki/'):
                # Evitar enlaces a archivos, categorías, etc.
                if not any(x in href for x in [':', '#', '?', 'Archivo:', 'Categoría:', 'Plantilla:']):
                    full_url = urljoin(self.base_url, href)
                    if full_url not in self.visited_urls:
                        links.append(full_url)
        
        return links
    
    def crawl_page(self, url):
        """Crawlear una página específica y extraer toda la información"""
        try:
            logger.info(f"Procesando: {url}")
            
            # Realizar request
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            # Parsear HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extraer título
            title_element = soup.find('h1', {'class': 'firstHeading'})
            title = title_element.get_text().strip() if title_element else "Sin título"
              # Extraer contenido principal - incluir más secciones
            content_div = soup.find('div', {'id': 'mw-content-text'})
            if not content_div:
                return None
            
            # Remover elementos no deseados pero mantener más contenido
            for element in content_div.find_all(['script', 'style']):  # Remover menos elementos
                element.decompose()
            
            # Extraer texto de múltiples secciones
            text_content = []
            
            # Contenido principal
            text_content.append(content_div.get_text())
            
            # Buscar secciones adicionales como referencias, enlaces externos, etc.
            for section in soup.find_all(['p', 'li', 'dd', 'dt']):
                if section.get_text().strip():
                    text_content.append(section.get_text())
            
            # Combinar todo el texto
            text = ' '.join(text_content)
            
            # Procesar palabras
            words = self.extract_words(text)
            
            if len(words) < 10:  # Saltar páginas con muy poco contenido
                return None
            
            # Generar n-gramas
            unigramas = words
            bigramas = self.generate_ngrams(words, 2)
            trigramas = self.generate_ngrams(words, 3)
            
            # Extraer enlaces
            links = self.extract_links(soup, url)
            
            # Obtener información de ediciones
            ediciones = self.get_page_revisions(title)
            
            # Crear registro de datos
            page_data = {
                'titulo': title,
                'url': url,
                'unigramas': unigramas,
                'bigramas': bigramas,
                'trigramas': trigramas,
                'links': links,
                'ediciones': ediciones,
                'timestamp': datetime.now().isoformat()            
            }
            
            return page_data
            
        except Exception as e:
            logger.error(f"Error procesando {url}: {e}")
            return None
    
    def crawl_recursive(self, start_urls, current_depth=0):
        """Crawlear recursivamente desde las URLs iniciales"""
        if current_depth >= self.max_depth or len(self.crawled_data) >= self.max_pages:
            return
        
        next_urls = []
        
        for url in start_urls:
            if url in self.visited_urls or len(self.crawled_data) >= self.max_pages:
                continue
            
            self.visited_urls.add(url)
            
            # Crawlear la página
            page_data = self.crawl_page(url)
            
            if page_data:
                self.crawled_data.append(page_data)
                next_urls.extend(page_data['links'][:25])  # Más enlaces por página para explorar más contenido
                
                logger.info(f"Páginas procesadas: {len(self.crawled_data)}/{self.max_pages}")                # Guardar progreso cada 5 páginas para mejor seguimiento
                if len(self.crawled_data) % 5 == 0:
                    self.save_progress_csv()  # Solo guardar CSV de progreso
                    self.save_state()  # Guardar estado para continuación
            
            # Delay entre requests
            time.sleep(self.delay)
        
        # Continuar recursivamente
        if next_urls and current_depth < self.max_depth - 1:
            self.crawl_recursive(next_urls, current_depth + 1)
    
    def save_progress_csv(self):
        """Guardar progreso intermedio en CSV y mostrar tamaño"""
        filename = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")
        
        if not self.crawled_data:
            return        # Preparar datos para CSV
        csv_data = []
        for page in self.crawled_data:
            row = {
                'titulo': page['titulo'],
                'url': page['url'],
                'unigramas': '|'.join(page['unigramas'][:1500]),  # Triplicado para más datos
                'bigramas': '|'.join(page['bigramas'][:1000]),   # Triplicado para más datos
                'trigramas': '|'.join(page['trigramas'][:800]),  # Cuadruplicado para más datos
                'links': '|'.join(page['links']),
                'ediciones': json.dumps(page['ediciones']),
                'timestamp': page['timestamp']
            }
            csv_data.append(row)
        
        # Guardar CSV
        df = pd.DataFrame(csv_data)
        df.to_csv(filename, index=False, encoding='utf-8')
          # Mostrar tamaño actual y estimación
        file_size_mb = os.path.getsize(filename) / (1024*1024)
        file_size_gb = file_size_mb / 1024
        
        # Calcular estimación para 1GB
        target_gb = 1.0
        if file_size_gb > 0:
            pages_needed = int((target_gb / file_size_gb) * len(self.crawled_data))
            pages_remaining = pages_needed - len(self.crawled_data)
            progress_percent = (file_size_gb / target_gb) * 100
            
            logger.info(f"CSV guardado: {file_size_mb:.2f} MB ({file_size_gb:.3f} GB) - {len(self.crawled_data)} páginas")
            logger.info(f"Progreso hacia 1GB: {progress_percent:.2f}% - Faltan aprox. {pages_remaining} páginas")
        else:
            logger.info(f"CSV guardado: {file_size_mb:.2f} MB ({file_size_gb:.3f} GB) - {len(self.crawled_data)} páginas")
    
    def save_to_csv(self, filename=None):
        """Guardar datos en formato CSV"""
        if not self.crawled_data:
            logger.warning("No hay datos para guardar")
            return
        
        if filename is None:
            filename = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")        # Preparar datos para CSV
        csv_data = []
        
        for page in self.crawled_data:
            row = {
                'titulo': page['titulo'],
                'url': page['url'],
                'unigramas': '|'.join(page['unigramas'][:1500]),  # Triplicado para más datos
                'bigramas': '|'.join(page['bigramas'][:1000]),   # Triplicado para más datos
                'trigramas': '|'.join(page['trigramas'][:800]),  # Cuadruplicado para más datos
                'links': '|'.join(page['links']),
                'ediciones': json.dumps(page['ediciones']),
            }
            csv_data.append(row)# Guardar CSV
        df = pd.DataFrame(csv_data)
        df.to_csv(filename, index=False, encoding='utf-8')
        
        # Mostrar tamaño final
        file_size_mb = os.path.getsize(filename) / (1024*1024)
        file_size_gb = file_size_mb / 1024
        logger.info(f"Datos guardados en {filename}")
        logger.info(f"Tamaño final del archivo: {file_size_mb:.2f} MB ({file_size_gb:.3f} GB)")
    
    def save_to_json(self, filename=None):
        """Guardar datos completos en formato JSON"""
        if filename is None:
            filename = os.path.join(self.data_dir, "wikipedia_crawl_data.json")
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.crawled_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Datos completos guardados en {filename}")
        logger.info(f"Tamaño del archivo: {os.path.getsize(filename) / (1024*1024):.2f} MB")
    
    def print_statistics(self):
        """Mostrar estadísticas del crawling"""
        if not self.crawled_data:
            logger.info("No hay datos para mostrar estadísticas")
            return
        
        total_pages = len(self.crawled_data)
        total_words = sum(len(page['unigramas']) for page in self.crawled_data)
        total_links = sum(len(page['links']) for page in self.crawled_data)
        
        logger.info("=== ESTADÍSTICAS DEL CRAWLING ===")
        logger.info(f"Páginas procesadas: {total_pages}")
        logger.info(f"Total de palabras: {total_words}")
        logger.info(f"Total de enlaces: {total_links}")
        logger.info(f"Promedio de palabras por página: {total_words/total_pages:.2f}")
        logger.info(f"Promedio de enlaces por página: {total_links/total_pages:.2f}")

    def save_state(self):
        """Guardar el estado actual del crawler para poder continuar después"""
        state_file = os.path.join(self.data_dir, "crawler_state.json")
        
        state = {
            'visited_urls': list(self.visited_urls),
            'crawled_data_count': len(self.crawled_data),
            'timestamp': datetime.now().isoformat()
        }
        
        with open(state_file, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Estado guardado: {len(self.visited_urls)} URLs visitadas, {len(self.crawled_data)} páginas procesadas")
    
    def load_state(self):
        """Cargar el estado previo del crawler si existe"""
        state_file = os.path.join(self.data_dir, "crawler_state.json")
        csv_file = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")
        
        if os.path.exists(state_file) and os.path.exists(csv_file):
            try:
                # Cargar estado
                with open(state_file, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                
                self.visited_urls = set(state['visited_urls'])
                
                # Cargar datos existentes del CSV
                df = pd.read_csv(csv_file, encoding='utf-8')
                logger.info(f"Cargando datos existentes: {len(df)} páginas del CSV")
                
                # Reconstruir crawled_data básico (sin n-gramas completos para ahorrar memoria)
                for _, row in df.iterrows():
                    page_data = {
                        'titulo': row['titulo'],
                        'url': row['url'],
                        'unigramas': row['unigramas'].split('|') if pd.notna(row['unigramas']) else [],
                        'bigramas': row['bigramas'].split('|') if pd.notna(row['bigramas']) else [],
                        'trigramas': row['trigramas'].split('|') if pd.notna(row['trigramas']) else [],
                        'links': row['links'].split('|') if pd.notna(row['links']) else [],
                        'ediciones': json.loads(row['ediciones']) if pd.notna(row['ediciones']) else {},
                        'timestamp': row.get('timestamp', datetime.now().isoformat())
                    }
                    self.crawled_data.append(page_data)
                
                file_size_mb = os.path.getsize(csv_file) / (1024*1024)
                logger.info(f"🔄 CONTINUANDO CRAWLING DESDE DONDE SE PAUSÓ")
                logger.info(f"📊 Estado recuperado: {len(self.visited_urls)} URLs visitadas")
                logger.info(f"📄 Páginas ya procesadas: {len(self.crawled_data)}")
                logger.info(f"💾 Tamaño actual del CSV: {file_size_mb:.2f} MB")
                return True
                
            except Exception as e:
                logger.warning(f"Error cargando estado previo: {e}")
                logger.info("Iniciando crawling desde cero...")
                return False
        
        logger.info("🆕 INICIANDO NUEVO CRAWLING")
        return False
    
    def get_pending_urls_from_crawled(self):
        """Extraer URLs pendientes de las páginas ya crawleadas para continuar"""
        pending_urls = []
        
        for page in self.crawled_data:
            for link in page['links']:
                if link not in self.visited_urls:
                    pending_urls.append(link)
        
        # Remover duplicados manteniendo orden
        seen = set()
        unique_pending = []
        for url in pending_urls:
            if url not in seen:
                seen.add(url)
                unique_pending.append(url)
        
        logger.info(f"🔗 URLs pendientes encontradas: {len(unique_pending)}")
        return unique_pending[:100]  # Limitar para no sobrecargar

def main():
    """Función principal para ejecutar el crawler"""
    # URL raíz - solo UNA página de inicio
    start_url = "https://es.wikipedia.org/wiki/Costa_Rica"
    
    # Crear crawler
    crawler = WikipediaCrawler(
        max_depth=8,      # Aumentar profundidad para más exploración
        max_pages=40000,  # Aumentar significativamente para alcanzar 1GB
        delay=0.2         # Acelerar aún más
    )
    
    logger.info("=== WIKIPEDIA CRAWLER CON CONTINUACIÓN ===")
    logger.info(f"Configuración: max_depth={crawler.max_depth}, max_pages={crawler.max_pages}")
    
    try:
        # Intentar cargar estado previo
        if crawler.load_state():
            # Si se cargó estado, obtener URLs pendientes
            pending_urls = crawler.get_pending_urls_from_crawled()
            
            if pending_urls:
                logger.info("🚀 Reanudando crawling con URLs pendientes")
                crawler.crawl_recursive(pending_urls)
            else:
                logger.info("✅ No se encontraron URLs pendientes. El crawling parece estar completo.")
        else:
            # Si no se pudo cargar el estado, iniciar nuevo crawling
            logger.info(f"🆕 URL raíz: {start_url}")
            crawler.crawl_recursive([start_url])
        
        # Mostrar estadísticas
        crawler.print_statistics()
        # Guardar datos
        crawler.save_to_csv()
        
        logger.info("✅ Crawling completado exitosamente!")
        
    except KeyboardInterrupt:
        logger.info("⏸️ Crawling PAUSADO por el usuario")
        logger.info("💾 Guardando progreso...")
        crawler.save_to_csv()
        crawler.save_state()
        logger.info("✅ Progreso guardado. Puedes continuar ejecutando el script nuevamente.")
        
    except Exception as e:
        logger.error(f"❌ Error durante el crawling: {e}")
        crawler.save_to_csv()
        crawler.save_state()

if __name__ == "__main__":
    main()