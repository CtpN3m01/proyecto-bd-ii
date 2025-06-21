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
from datetime import datetime, timedelta
import logging
from tqdm import tqdm
import colorama
from colorama import Fore, Back, Style

# Inicializar colorama para colores en Windows
colorama.init()

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
        
        # Variables para tracking de progreso
        self.start_time = datetime.now()
        self.target_size_gb = 1.0
        self.progress_bar = None
        self.last_update_time = datetime.now()
        self.pages_per_minute = 0
        self.avg_page_size_kb = 0
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
    
    def init_progress_tracking(self):
        """Inicializar el sistema de tracking de progreso"""
        self.start_time = datetime.now()
        self.last_update_time = datetime.now()
        self.pages_per_minute = 0
        self.avg_page_size_kb = 0
        
        # Configurar barra de progreso con descripción
        self.progress_bar = tqdm(
            total=self.max_pages,
            desc=f"{Fore.CYAN}📊 Crawling Wikipedia{Style.RESET_ALL}",
            unit="páginas",
            unit_scale=False,
            bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]"
        )
    
    def update_progress_display(self, current_file_size_mb=0):
        """Actualizar la visualización de progreso con información detallada"""
        if not self.progress_bar:
            return
            
        current_time = datetime.now()
        elapsed_time = current_time - self.start_time
        elapsed_minutes = elapsed_time.total_seconds() / 60
        
        # Calcular velocidad de páginas por minuto
        if elapsed_minutes > 0:
            self.pages_per_minute = len(self.crawled_data) / elapsed_minutes
        
        # Calcular tamaño promedio por página
        if len(self.crawled_data) > 0 and current_file_size_mb > 0:
            self.avg_page_size_kb = (current_file_size_mb * 1024) / len(self.crawled_data)
        
        # Calcular progreso hacia 1GB
        current_size_gb = current_file_size_mb / 1024
        progress_percent = min((current_size_gb / self.target_size_gb) * 100, 100)
        
        # Estimar tiempo restante para completar 1GB
        if current_size_gb > 0 and self.pages_per_minute > 0:
            # Estimar páginas necesarias para 1GB
            estimated_pages_for_1gb = (self.target_size_gb * 1024) / self.avg_page_size_kb if self.avg_page_size_kb > 0 else self.max_pages
            remaining_pages = max(0, estimated_pages_for_1gb - len(self.crawled_data))
            remaining_minutes = remaining_pages / self.pages_per_minute if self.pages_per_minute > 0 else 0
            remaining_time = timedelta(minutes=remaining_minutes)
        else:
            remaining_time = timedelta(0)
        
        # Actualizar barra de progreso
        self.progress_bar.update(1)
        
        # Mostrar información detallada cada 10 páginas
        if len(self.crawled_data) % 10 == 0:
            self.show_detailed_progress(current_size_gb, progress_percent, remaining_time)
    
    def show_detailed_progress(self, current_size_gb, progress_percent, remaining_time):
        """Mostrar información detallada de progreso"""
        # Limpiar línea anterior y mostrar estadísticas
        print(f"\n{Back.BLUE}{Fore.WHITE} PROGRESO HACIA 1GB {Style.RESET_ALL}")
        
        # Barra de progreso visual hacia 1GB
        bar_length = 50
        filled_length = int(bar_length * progress_percent / 100)
        bar = f"{Fore.GREEN}{'█' * filled_length}{Fore.RED}{'░' * (bar_length - filled_length)}{Style.RESET_ALL}"
        
        print(f"📊 Progreso: {bar} {Fore.YELLOW}{progress_percent:.1f}%{Style.RESET_ALL}")
        print(f"💾 Tamaño actual: {Fore.CYAN}{current_size_gb * 1024:.1f} MB{Style.RESET_ALL} ({Fore.YELLOW}{current_size_gb:.3f} GB{Style.RESET_ALL})")
        print(f"📄 Páginas procesadas: {Fore.GREEN}{len(self.crawled_data)}{Style.RESET_ALL}")
        print(f"⚡ Velocidad: {Fore.MAGENTA}{self.pages_per_minute:.1f} páginas/min{Style.RESET_ALL}")
        print(f"📏 Tamaño promedio: {Fore.CYAN}{self.avg_page_size_kb:.1f} KB/página{Style.RESET_ALL}")
        
        if remaining_time.total_seconds() > 0:
            hours, remainder = divmod(remaining_time.total_seconds(), 3600)
            minutes, _ = divmod(remainder, 60)
            if hours > 0:
                time_str = f"{int(hours)}h {int(minutes)}m"
            else:
                time_str = f"{int(minutes)}m"
            print(f"⏰ Tiempo estimado para 1GB: {Fore.YELLOW}{time_str}{Style.RESET_ALL}")
        
        print(f"{'-' * 60}")
    
    def close_progress_tracking(self):
        """Cerrar el sistema de tracking de progreso"""
        if self.progress_bar:
            self.progress_bar.close()
            
        # Mostrar resumen final
        total_time = datetime.now() - self.start_time
        print(f"\n{Back.GREEN}{Fore.WHITE} CRAWLING COMPLETADO {Style.RESET_ALL}")
        print(f"⏱️  Tiempo total: {Fore.CYAN}{total_time}{Style.RESET_ALL}")
        print(f"📄 Total de páginas: {Fore.GREEN}{len(self.crawled_data)}{Style.RESET_ALL}")
        print(f"⚡ Velocidad promedio: {Fore.MAGENTA}{len(self.crawled_data) / (total_time.total_seconds() / 60):.1f} páginas/min{Style.RESET_ALL}")
    
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
        all_links_found = 0
        valid_wiki_links = 0
        
        # Buscar todos los enlaces
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            all_links_found += 1
            
            # Filtrar solo enlaces a otras páginas de Wikipedia
            if href and href.startswith('/wiki/'):
                valid_wiki_links += 1
                # Evitar enlaces a archivos, categorías, etc.
                if not any(x in href for x in [':', '#', '?', 'Archivo:', 'Categoría:', 'Plantilla:']):
                    full_url = urljoin(self.base_url, href)
                    if full_url not in self.visited_urls:
                        links.append(full_url)
        
        # Debug: mostrar estadísticas de extracción de enlaces
        logger.info(f"🔗 Enlaces en {current_url}: {all_links_found} total, {valid_wiki_links} /wiki/, {len(links)} únicos válidos")
        
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
        
        # Inicializar progreso si es la primera vez
        if current_depth == 0 and not self.progress_bar:
            self.init_progress_tracking()
        
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
                
                # Guardar progreso cada 20 páginas para mejor rendimiento
                if len(self.crawled_data) % 20 == 0:
                    self.save_progress_lightweight()  # Guardado rápido y ligero
                    self.save_state()  # Guardar estado para continuación
                
                # Actualizar progreso con información del archivo CSV
                csv_file = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")
                current_file_size_mb = 0
                if os.path.exists(csv_file):
                    current_file_size_mb = os.path.getsize(csv_file) / (1024 * 1024)
                
                # Actualizar display de progreso
                self.update_progress_display(current_file_size_mb)
            
            # Delay entre requests
            time.sleep(self.delay)
        
        # Continuar recursivamente
        if next_urls and current_depth < self.max_depth - 1:
            self.crawl_recursive(next_urls, current_depth + 1)
    
    def safe_string(self, text, max_length=None):
        """Limpiar string para que sea seguro para CSV"""
        if not text:
            return ""
        
        # Convertir a string y limpiar caracteres problemáticos
        text = str(text)
        text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
        
        # Para URLs, preservar caracteres importantes como :, /, =, ?, #, %
        if text.startswith('http'):
            # Solo limpiar caracteres realmente problemáticos para URLs
            text = re.sub(r'["\'\`]', '', text)  # Eliminar comillas
        else:
            # Para texto normal, limpiar más agresivamente pero preservar algunos caracteres
            text = re.sub(r'[^\w\s\-_.,;:|/=?#%()áéíóúñüÁÉÍÓÚÑÜ]', ' ', text)
        
        text = ' '.join(text.split())  # Normalizar espacios
        
        if max_length:
            text = text[:max_length]
        
        return text

    def save_progress_csv(self):
        """Guardar progreso intermedio en CSV y mostrar tamaño"""
        filename = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")
        
        if not self.crawled_data:
            return
        
        # Preparar datos para CSV con limpieza robusta
        csv_data = []
        for i, page in enumerate(self.crawled_data):
            try:
                # Limpiar y validar cada campo
                titulo = self.safe_string(page.get('titulo', ''), 500)
                url = self.safe_string(page.get('url', ''), 500)
                
                # Procesar n-gramas de forma segura
                unigramas = []
                for unigrama in page.get('unigramas', [])[:1500]:
                    clean_unigrama = self.safe_string(unigrama, 100)
                    if clean_unigrama:
                        unigramas.append(clean_unigrama)
                
                bigramas = []
                for bigrama in page.get('bigramas', [])[:1000]:
                    clean_bigrama = self.safe_string(bigrama, 150)
                    if clean_bigrama:
                        bigramas.append(clean_bigrama)
                
                trigramas = []
                for trigrama in page.get('trigramas', [])[:800]:
                    clean_trigrama = self.safe_string(trigrama, 200)
                    if clean_trigrama:
                        trigramas.append(clean_trigrama)
                
                # Procesar enlaces de forma segura
                links = []
                for link in page.get('links', [])[:100]:  # Limitar enlaces para evitar filas muy grandes
                    clean_link = self.safe_string(link, 500)
                    if clean_link and clean_link.startswith('http'):
                        links.append(clean_link)
                
                # Procesar ediciones de forma segura
                ediciones_dict = page.get('ediciones', {})
                ediciones_str = ""
                try:
                    if isinstance(ediciones_dict, dict) and ediciones_dict:
                        # Limitar las ediciones para evitar campos muy grandes
                        limited_ediciones = dict(list(ediciones_dict.items())[:50])
                        ediciones_str = json.dumps(limited_ediciones, ensure_ascii=False)[:1000]
                    else:
                        ediciones_str = "{}"
                except:
                    ediciones_str = "{}"
                
                row = {
                    'titulo': titulo,
                    'url': url,
                    'unigramas': '|'.join(unigramas),
                    'bigramas': '|'.join(bigramas),
                    'trigramas': '|'.join(trigramas),
                    'links': '|'.join(links),
                    'ediciones': ediciones_str,
                    'timestamp': self.safe_string(page.get('timestamp', ''), 50)
                }
                csv_data.append(row)
                
            except Exception as e:
                logger.warning(f"Error procesando página {i}: {e}")
                continue
        
        if not csv_data:
            logger.warning("No hay datos válidos para guardar")
            return
        
        # Intentar guardar CSV con múltiples estrategias
        max_retries = 3
        for attempt in range(max_retries):
            try:
                df = pd.DataFrame(csv_data)
                
                # Estrategia 1: Guardar normal
                if attempt == 0:
                    df.to_csv(filename, index=False, encoding='utf-8')
                # Estrategia 2: Cambiar encoding
                elif attempt == 1:
                    df.to_csv(filename, index=False, encoding='utf-8-sig')
                # Estrategia 3: Usar archivo temporal y renombrar
                else:
                    temp_filename = filename + '.tmp'
                    df.to_csv(temp_filename, index=False, encoding='utf-8')
                    if os.path.exists(filename):
                        os.remove(filename)
                    os.rename(temp_filename, filename)
                
                break  # Si llegamos aquí, fue exitoso
                
            except Exception as e:
                logger.warning(f"Intento {attempt + 1} fallido: {e}")
                if attempt == max_retries - 1:
                    # Último intento: guardar como backup con timestamp
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    backup_filename = os.path.join(self.data_dir, f"wikipedia_crawl_backup_{timestamp}.csv")
                    try:
                        df.to_csv(backup_filename, index=False, encoding='utf-8')
                        filename = backup_filename
                        logger.info(f"Guardado como archivo de respaldo: {backup_filename}")
                    except Exception as backup_error:
                        logger.error(f"Error crítico guardando CSV: {backup_error}")
                        return
                else:
                    time.sleep(1)  # Esperar antes del siguiente intento
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
            filename = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")
        
        # Preparar datos para CSV con limpieza robusta
        csv_data = []
        for i, page in enumerate(self.crawled_data):
            try:
                # Limpiar y validar cada campo
                titulo = self.safe_string(page.get('titulo', ''), 500)
                url = self.safe_string(page.get('url', ''), 500)
                
                # Procesar n-gramas de forma segura
                unigramas = []
                for unigrama in page.get('unigramas', [])[:1500]:
                    clean_unigrama = self.safe_string(unigrama, 100)
                    if clean_unigrama:
                        unigramas.append(clean_unigrama)
                
                bigramas = []
                for bigrama in page.get('bigramas', [])[:1000]:
                    clean_bigrama = self.safe_string(bigrama, 150)
                    if clean_bigrama:
                        bigramas.append(clean_bigrama)
                
                trigramas = []
                for trigrama in page.get('trigramas', [])[:800]:
                    clean_trigrama = self.safe_string(trigrama, 200)
                    if clean_trigrama:
                        trigramas.append(clean_trigrama)
                
                # Procesar enlaces de forma segura
                links = []
                for link in page.get('links', [])[:100]:
                    clean_link = self.safe_string(link, 500)
                    if clean_link and clean_link.startswith('http'):
                        links.append(clean_link)
                
                # Procesar ediciones de forma segura
                ediciones_dict = page.get('ediciones', {})
                ediciones_str = ""
                try:
                    if isinstance(ediciones_dict, dict) and ediciones_dict:
                        limited_ediciones = dict(list(ediciones_dict.items())[:50])
                        ediciones_str = json.dumps(limited_ediciones, ensure_ascii=False)[:1000]
                    else:
                        ediciones_str = "{}"
                except:
                    ediciones_str = "{}"
                
                row = {
                    'titulo': titulo,
                    'url': url,
                    'unigramas': '|'.join(unigramas),
                    'bigramas': '|'.join(bigramas),
                    'trigramas': '|'.join(trigramas),
                    'links': '|'.join(links),
                    'ediciones': ediciones_str,
                    'timestamp': self.safe_string(page.get('timestamp', ''), 50)
                }
                csv_data.append(row)
                
            except Exception as e:
                logger.warning(f"Error procesando página {i} para CSV final: {e}")
                continue
        
        if not csv_data:
            logger.warning("No hay datos válidos para guardar")
            return
        
        # Intentar guardar CSV con múltiples estrategias
        max_retries = 3
        for attempt in range(max_retries):
            try:
                df = pd.DataFrame(csv_data)
                
                if attempt == 0:
                    df.to_csv(filename, index=False, encoding='utf-8')
                elif attempt == 1:
                    df.to_csv(filename, index=False, encoding='utf-8-sig')
                else:
                    temp_filename = filename + '.tmp'
                    df.to_csv(temp_filename, index=False, encoding='utf-8')
                    if os.path.exists(filename):
                        os.remove(filename)
                    os.rename(temp_filename, filename)
                
                break
                
            except Exception as e:
                logger.warning(f"Intento final {attempt + 1} fallido: {e}")
                if attempt == max_retries - 1:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    backup_filename = os.path.join(self.data_dir, f"wikipedia_crawl_backup_{timestamp}.csv")
                    try:
                        df.to_csv(backup_filename, index=False, encoding='utf-8')
                        filename = backup_filename
                        logger.info(f"Guardado como archivo de respaldo: {backup_filename}")
                    except Exception as backup_error:
                        logger.error(f"Error crítico guardando CSV final: {backup_error}")
                        return
                else:
                    time.sleep(1)
        
        # Mostrar tamaño final
        try:
            file_size_mb = os.path.getsize(filename) / (1024*1024)
            file_size_gb = file_size_mb / 1024
            logger.info(f"Datos guardados en {filename}")
            logger.info(f"Tamaño final del archivo: {file_size_mb:.2f} MB ({file_size_gb:.3f} GB)")
        except Exception as e:
            logger.warning(f"Error calculando tamaño del archivo: {e}")
    
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
        
        # Debug: Mostrar información detallada sobre enlaces
        pages_with_links = sum(1 for page in self.crawled_data if len(page.get('links', [])) > 0)
        if total_pages > 0:
            avg_links_per_page = total_links / total_pages
        else:
            avg_links_per_page = 0
        
        logger.info("=== ESTADÍSTICAS DEL CRAWLING ===")
        logger.info(f"Páginas procesadas: {total_pages}")
        logger.info(f"Total de palabras: {total_words}")
        logger.info(f"Total de enlaces: {total_links}")
        logger.info(f"Páginas con enlaces: {pages_with_links}/{total_pages}")
        logger.info(f"Promedio de palabras por página: {total_words/total_pages:.2f}")
        logger.info(f"Promedio de enlaces por página: {avg_links_per_page:.2f}")
        
        # Si no hay enlaces, es un problema
        if total_links == 0:
            logger.warning("⚠️ PROBLEMA: No se encontraron enlaces en ninguna página!")
            logger.warning("   Esto significa que:")
            logger.warning("   1. La extracción de enlaces no está funcionando")
            logger.warning("   2. Los enlaces se perdieron durante el guardado/carga")
            logger.warning("   3. Las páginas no tienen enlaces válidos de Wikipedia")

    def save_state(self):
        """Guardar el estado actual del crawler para poder continuar después - versión optimizada"""
        state_file = os.path.join(self.data_dir, "crawler_state.json")
        
        # Estado mínimo para máximo rendimiento
        state = {
            'visited_urls_count': len(self.visited_urls),
            'crawled_data_count': len(self.crawled_data),
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Guardar solo una muestra de URLs visitadas para verificación
        if len(self.visited_urls) > 1000:
            state['visited_urls_sample'] = list(self.visited_urls)[-1000:]  # Solo las últimas 1000
        else:
            state['visited_urls_sample'] = list(self.visited_urls)
        
        try:
            with open(state_file, 'w', encoding='utf-8') as f:
                json.dump(state, f, ensure_ascii=False, separators=(',', ':'))  # Formato compacto
        except:
            pass  # No interrumpir el crawling por problemas de estado
    
    def load_state(self):
        """Cargar el estado previo del crawler si existe"""
        state_file = os.path.join(self.data_dir, "crawler_state.json")
        csv_file = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")
        
        if os.path.exists(csv_file):
            try:
                # Solo necesitamos el CSV para continuar (es más confiable que el JSON)
                # Cargar datos existentes del CSV
                df = pd.read_csv(csv_file, encoding='utf-8')
                logger.info(f"Cargando datos existentes: {len(df)} páginas del CSV")
                
                # Reconstruir visited_urls desde las URLs del CSV
                self.visited_urls = set()
                for _, row in df.iterrows():
                    if pd.notna(row['url']) and row['url'].strip():
                        self.visited_urls.add(row['url'])
                  # Reconstruir crawled_data básico (sin n-gramas completos para ahorrar memoria)
                for _, row in df.iterrows():
                    # Procesar links de forma más segura
                    links_str = row['links'] if pd.notna(row['links']) else ''
                    links = []
                    if links_str:
                        # Dividir por | y limpiar cada link
                        raw_links = links_str.split('|')
                        for link in raw_links:
                            link = link.strip()
                            # Solo agregar links que se vean como URLs válidas
                            if link.startswith('http') and '.' in link and ' ' not in link:
                                links.append(link)
                    
                    page_data = {
                        'titulo': row['titulo'],
                        'url': row['url'],
                        'unigramas': row['unigramas'].split('|') if pd.notna(row['unigramas']) else [],
                        'bigramas': row['bigramas'].split('|') if pd.notna(row['bigramas']) else [],
                        'trigramas': row['trigramas'].split('|') if pd.notna(row['trigramas']) else [],
                        'links': links,  # Usar links procesados y limpios
                        'ediciones': json.loads(row['ediciones']) if pd.notna(row['ediciones']) and row['ediciones'].strip() else {},
                        'timestamp': row.get('timestamp', datetime.now().isoformat())
                    }
                    self.crawled_data.append(page_data)
                
                file_size_mb = os.path.getsize(csv_file) / (1024*1024)
                logger.info(f"🔄 CONTINUANDO CRAWLING DESDE DONDE SE PAUSÓ")
                logger.info(f"📊 Estado recuperado: {len(self.visited_urls)} URLs visitadas")
                logger.info(f"📄 Páginas ya procesadas: {len(self.crawled_data)}")
                logger.info(f"💾 Tamaño actual del CSV: {file_size_mb:.2f} MB")
                
                # Guardar el estado actualizado para futuras ejecuciones
                self.save_state()
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
        
        logger.info(f"🔍 Analizando {len(self.crawled_data)} páginas para encontrar enlaces pendientes...")
        
        for i, page in enumerate(self.crawled_data):
            page_links = page.get('links', [])
            if i < 5:  # Debug: mostrar los primeros 5 páginas
                logger.info(f"📄 Página {i+1} '{page.get('titulo', 'Sin título')}': {len(page_links)} enlaces")
            
            for link in page_links:
                # Validar y limpiar URL antes de agregar
                if link and isinstance(link, str):
                    # Asegurar que la URL esté bien formada
                    if link.startswith('http'):
                        # Verificar que no esté corrupta (sin espacios donde no debería)
                        if ' ' not in link.replace('https://', '').replace('http://', ''):
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
        
        # Si no hay URLs pendientes, el crawling ha terminado naturalmente
        if len(unique_pending) == 0:
            logger.info("✅ No se encontraron más URLs pendientes.")
            logger.info("   Esto significa que:")
            logger.info("   1. Todos los enlaces válidos han sido visitados")
            logger.info("   2. El crawling recursivo desde la URL raíz está completo")
            logger.info("   3. No hay más páginas por explorar en esta rama")
        
        return unique_pending[:100]  # Limitar para no sobrecargar

    def save_progress_lightweight(self):
        """Guardar progreso de forma rápida y ligera - solo agregar nuevas filas"""
        filename = os.path.join(self.data_dir, "wikipedia_crawl_data.csv")
        
        if not self.crawled_data:
            return
          # Determinar si es la primera vez que guardamos
        is_first_save = not os.path.exists(filename)
        
        if not self.crawled_data:
            return
        
        # Si es continuación, solo guardar las páginas nuevas
        if not is_first_save:
            # Verificar cuántas páginas ya están en el archivo
            try:
                existing_df = pd.read_csv(filename, encoding='utf-8')
                existing_count = len(existing_df)
                # Solo guardar las páginas nuevas
                pages_to_save = self.crawled_data[existing_count:]
            except:
                # Si hay error leyendo, guardar todas
                pages_to_save = self.crawled_data
        else:
            pages_to_save = self.crawled_data
        
        # Preparar datos de forma más eficiente
        csv_rows = []
        for page in pages_to_save:
            # Proceso más rápido sin validación excesiva
            row = {
                'titulo': str(page.get('titulo', ''))[:500].replace('\n', ' ').replace('\r', ' '),
                'url': str(page.get('url', ''))[:500],
                'unigramas': '|'.join(str(w) for w in page.get('unigramas', [])[:1500]),
                'bigramas': '|'.join(str(w) for w in page.get('bigramas', [])[:1000]),
                'trigramas': '|'.join(str(w) for w in page.get('trigramas', [])[:800]),
                'links': '|'.join(str(link) for link in page.get('links', [])[:100]),
                'ediciones': json.dumps(page.get('ediciones', {}))[:1000],
                'timestamp': str(page.get('timestamp', ''))
            }
            csv_rows.append(row)
        
        try:            # Guardar de forma más eficiente
            df = pd.DataFrame(csv_rows)
            
            if is_first_save:
                # Primera vez: crear archivo completo
                df.to_csv(filename, index=False, encoding='utf-8', mode='w')
            else:
                # Append mode para agregar solo las nuevas filas (MÁS RÁPIDO)
                if len(pages_to_save) > 0:  # Solo si hay páginas nuevas
                    df.to_csv(filename, index=False, encoding='utf-8', mode='a', header=False)
              # Mostrar progreso rápido sin cálculos complejos
            if len(self.crawled_data) % 100 == 0:  # Solo cada 100 páginas mostrar tamaño
                try:
                    file_size_mb = os.path.getsize(filename) / (1024*1024)
                    file_size_gb = file_size_mb / 1024
                    logger.info(f"💾 CSV: {file_size_mb:.1f} MB ({file_size_gb:.3f} GB) - {len(self.crawled_data)} páginas")
                except:
                    pass
                    
        except Exception as e:
            logger.warning(f"Error en guardado ligero: {e}")
            # Fallback al método robusto solo si falla
            self.save_progress_csv()

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
        # Mostrar banner inicial con colores
        print(f"\n{Back.BLUE}{Fore.WHITE} 🌐 WIKIPEDIA CRAWLER - HACIA 1GB DE DATOS 🌐 {Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Target: {Fore.GREEN}1.0 GB{Style.RESET_ALL} | {Fore.YELLOW}Max páginas: {Fore.GREEN}{crawler.max_pages:,}{Style.RESET_ALL} | {Fore.YELLOW}Profundidad: {Fore.GREEN}{crawler.max_depth}{Style.RESET_ALL}")
        print(f"{'-' * 60}")
        
        # Intentar cargar estado previo
        if crawler.load_state():
            # Si se cargó estado, obtener URLs pendientes
            pending_urls = crawler.get_pending_urls_from_crawled()
            
            if pending_urls:
                logger.info("🚀 Reanudando crawling con URLs pendientes")
                # Mostrar estado de continuación
                csv_file = os.path.join(crawler.data_dir, "wikipedia_crawl_data.csv")
                if os.path.exists(csv_file):
                    current_size_mb = os.path.getsize(csv_file) / (1024 * 1024)
                    current_size_gb = current_size_mb / 1024
                    progress_percent = min((current_size_gb / crawler.target_size_gb) * 100, 100)
                    
                    print(f"{Back.GREEN}{Fore.WHITE} CONTINUANDO DESDE DONDE SE PAUSÓ {Style.RESET_ALL}")
                    print(f"📊 Progreso actual: {Fore.YELLOW}{progress_percent:.1f}%{Style.RESET_ALL} hacia 1GB")
                    print(f"💾 Tamaño actual: {Fore.CYAN}{current_size_mb:.1f} MB{Style.RESET_ALL}")
                    print(f"📄 Páginas ya procesadas: {Fore.GREEN}{len(crawler.crawled_data)}{Style.RESET_ALL}")
                    print(f"{'-' * 60}")
                
                crawler.crawl_recursive(pending_urls)
            else:
                logger.info("✅ No se encontraron URLs pendientes. El crawling parece estar completo.")
        else:
            # Si no se pudo cargar el estado, iniciar nuevo crawling
            logger.info(f"🆕 URL raíz: {start_url}")
            print(f"{Back.GREEN}{Fore.WHITE} INICIANDO NUEVO CRAWLING {Style.RESET_ALL}")
            print(f"🌱 URL raíz: {Fore.CYAN}{start_url}{Style.RESET_ALL}")
            print(f"{'-' * 60}")
            crawler.crawl_recursive([start_url])
        
        # Mostrar estadísticas
        crawler.print_statistics()
        # Guardar datos
        crawler.save_to_csv()
          # Cerrar tracking de progreso
        crawler.close_progress_tracking()
        
        logger.info("✅ Crawling completado exitosamente!")
        
    except KeyboardInterrupt:
        logger.info("⏸️ Crawling PAUSADO por el usuario")
        logger.info("💾 Guardando progreso...")
        
        # Cerrar tracking de progreso
        if hasattr(crawler, 'progress_bar') and crawler.progress_bar:
            crawler.close_progress_tracking()
        
        crawler.save_to_csv()
        crawler.save_state()
        logger.info("✅ Progreso guardado. Puedes continuar ejecutando el script nuevamente.")
        
    except Exception as e:
        logger.error(f"❌ Error durante el crawling: {e}")
        
        # Cerrar tracking de progreso
        if hasattr(crawler, 'progress_bar') and crawler.progress_bar:
            crawler.close_progress_tracking()
        
        crawler.save_to_csv()
        crawler.save_state()

if __name__ == "__main__":
    main()