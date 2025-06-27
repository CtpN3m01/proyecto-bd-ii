import logging
logging.getLogger("py4j").setLevel(logging.ERROR)

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.window import Window
from pyspark.sql import functions as F
from pyspark.sql.types import *
from graphframes import GraphFrame

spark = SparkSession.builder.appName("ProcesamientoCSV").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# 🔹 Cargar el archivo CSV
df_sucio = spark.read.csv("wikipedia_crawl_data.csv", header=True)



""" PRE PROCESADO """

# Filtrar filas donde 'url' comienza con "http://" o "https://"
df = df_sucio.filter(col("url").rlike("^https?://.*$"))

# Limpiar palabras muy largas
df = df.withColumn(
    "palabras",
    expr("""
        array_join(
            filter(
                split(palabras, '\\\\|'),
                x -> length(trim(x)) > 2 AND length(trim(x)) <= 24
            ),
            '|'
        )
    """)
)

# Limpiar bigramas muy largos (ejemplo: frases de más de 60 caracteres)
df = df.withColumn(
    "bigramas",
    expr("""
        array_join(
            filter(
                split(bigramas, '\\\\|'),
                x -> length(trim(x)) > 4 AND length(trim(x)) <= 49
            ),
            '|'
        )
    """)
)

# Limpiar trigramas muy largos (ejemplo: frases de más de 90 caracteres)
df = df.withColumn(
    "trigramas",
    expr("""
        array_join(
            filter(
                split(trigramas, '\\\\|'),
                x -> length(trim(x)) > 6 AND length(trim(x)) <= 73
            ),
            '|'
        )
    """)
)

# 1. Preprocesar la cadena de la columna 'ediciones'
#    Se asume que la cadena tiene este formato:
#    "{""2025-06-20"": 2|""2025-06-17"": 1|""2025-06-16"": 1|...}"
#    y queremos transformarla en:
#    {"2025-06-20": 2, "2025-06-17": 1, "2025-06-16": 1, ...}
df_procesado = df_sucio.withColumn("ediciones_clean",
    # El substring(...) remueve el primer y último carácter (las comillas externas)
    regexp_replace(
        # Reemplazamos los pipes (|) por comas (,)
        regexp_replace(
            expr("substring(ediciones, 2, length(ediciones)-2)"),
            "\\|", ","
        ),
        # Reemplazamos las dobles comillas seguidas (""), por una sola (")
        '""', '"'
    )
)

# 2. Convertir la cadena 'ediciones_clean' en un Map (diccionario) usando from_json
df_procesado = df_procesado.withColumn("ediciones_map",
    from_json(col("ediciones_clean"), MapType(StringType(), IntegerType()))
)

# 3. Sumar los valores del mapa.
df_procesado = df_procesado.withColumn(
    "ediciones_total",
    expr("aggregate(map_values(ediciones_map), 0, (acc, x) -> acc + x)")
)

# 4. Calcular edits_por_dia (dividiendo entre la cantidad de días, por ejemplo, 365)
dias = 365
df_procesado = df_procesado.withColumn("edits_por_dia", col("ediciones_total") / lit(dias))





""" PARA DF_PAGINA """

dias = 365  # Suposición: cada página tiene 1 año de antigüedad

# DATASET
df_pre_pagina = df.select(
    # Id
    # monotonically_increasing_id().alias("pagina_id"),
    (row_number().over(Window.orderBy("url")) - 1).alias("pagina_id"),  # -1 para empezar en 0

    # Título y URL
    "titulo", "url",

    # Número total de palabras
    size(split(col("palabras"), r"\|")).alias("num_palabras"),

    # Número de palabras únicas
    size(array_distinct(split(col("palabras"), r"\|"))).alias("num_palabras_unicas"),

    # Número de enlaces salientes
    # size(split(col("links"), r"\|")).alias("enlaces_salientes"),

    #(col("ediciones").cast("double") / lit(dias)).alias("edits_por_dia"),

    # Longitud promedio
    expr("""
        aggregate(
            split(palabras, '\\\\|'),
            0,
            (acc, x) -> acc + length(x),
            acc -> acc / size(split(palabras, '\\\\|'))
        )
    """).alias("longitud_promedio")
)

# Ediciones por día
df_pre_pagina = df_pre_pagina.join(
    df_procesado.select("url", "edits_por_dia"), 
    on="url", 
    how="left"
)

df_pagina = df_pre_pagina.filter(col("edits_por_dia").isNotNull())


""" 🔸 Crear grafo """

# 1. Crear el DataFrame de vértices a partir de df_pagina.
#    Necesitamos que la columna se llame "id" para GraphFrames.
vertices = df_pagina.select(
    col("pagina_id").alias("id"),
    "url",
    "titulo"  # Puedes agregar otros campos que consideres importantes.
)

# 2. Crear el DataFrame de aristas (edges) a partir de df, usando la columna "links".
#    Separamos los enlaces, que suponemos están separados por ';' y obtenemos la URL destino.
#    NOTA: Dependiendo de tus datos, es posible que necesites hacer limpieza adicional.
edges_temp = df.select("url", "links")
edges = edges_temp.withColumn(
    "dst_url", explode(split(col("links"), r"\|"))
).select(
    col("url").alias("src"),
    "dst_url"
)

# 3. Filtrar las aristas para quedarnos solo con aquellas cuyo destino está en nuestro grafo.
#    Para ello, unimos con el DataFrame de vértices, usando la URL destino.
#    También nos aseguramos de que la fuente (src) esté entre nuestras páginas.
edges = edges.join(
    vertices.select(col("id").alias("dst_id"), col("url").alias("dst_url")),
    on="dst_url",
    how="inner"
).join(
    vertices.select(col("id").alias("src_id"), col("url").alias("src_url")),
    edges.src == col("src_url"),
    how="inner"
).select(
    col("src_id").alias("src"),
    col("dst_id").alias("dst")
)

# 4. Construir el grafo con GraphFrame.
g = GraphFrame(vertices, edges)

# 5. Calcular PageRank.
pagerank_result = g.pageRank(resetProbability=0.15, maxIter=10)
# pagerank_result.vertices tendrá una columna "pagerank" para cada vértice.

# 6. Calcular el número de enlaces entrantes (inDegree), que corresponde a "enlaces_entrantes" y los outDegree.
in_degrees = g.inDegrees  # Este DataFrame tiene columnas: id y inDegree
out_degrees = g.outDegrees # Este DataFrame tiene columnas: id y outDegree

# 7. Unir los resultados con el DataFrame de vértices.
vertices_enriched = vertices.join(
    pagerank_result.vertices.select("id", "pagerank"), on="id", how="left"
).join(
    in_degrees, on="id", how="left"
).withColumnRenamed("inDegree", "enlaces_entrantes").join(
    out_degrees, on="id", how="left"
).withColumnRenamed("outDegree", "enlaces_salientes")

# 8. Unir el resultado enriquecido con df_pagina.
#    De esta forma, agregamos las nuevas columnas "pagerank" y "enlaces_entrantes" a df_pagina.
df_pagina_enriched = df_pagina.join(
    vertices_enriched.select(col("id").alias("pagina_id"), "pagerank", "enlaces_entrantes", "enlaces_salientes"),
    on="pagina_id",
    how="left"
).withColumn(
    "enlaces_salientes",
    coalesce(col("enlaces_salientes"), lit(0))
).withColumn(
    "enlaces_entrantes",
    coalesce(col("enlaces_entrantes"), lit(0))
)





""" PARA DF_PALABRA_PAGINA """

# Paso 1: Obtener la relación url -> pagina_id desde df_pagina
url_to_id = df_pagina.select("url", "pagina_id").distinct()

# Paso 2: Explotar palabras del df original y unir con los IDs
palabras_explode = df.select(
    col("url"),
    explode(split(col("palabras"), r"\|")).alias("palabra")
).join(
    url_to_id,
    on="url",
    how="left"
).filter(col("pagina_id").isNotNull())

# Paso 3: Contar ocurrencias por palabra y página
conteo_palabras = palabras_explode.groupBy("pagina_id", "palabra").agg(
    count("*").alias("veces_aparicion")
)

# Paso 4: Obtener total de palabras por página (desde df_pagina)
total_palabras = df_pagina.select("pagina_id", "num_palabras")

# Paso 5: Calcular frecuencia
df_palabra_pagina = conteo_palabras.join(
    total_palabras,
    on="pagina_id",
    how="left"
).withColumn(
    "frecuencia",
    col("veces_aparicion") # / col("num_palabras")
).select(
    "palabra",
    "pagina_id",
    "frecuencia"
)





""" PARA DF_PORCENTAJE_PALABRA_PAGINA """

# Lo mismo de antes, pero con porcentajes
df_porcentaje_palabra_pagina = df_palabra_pagina.join(
    total_palabras,
    on="pagina_id",
    how="left"
).select(
    "palabra",
    "pagina_id",
    ((col("frecuencia") / col("num_palabras")) * 100).alias("porcentaje")
)





""" PARA DF_NGRAM """

# 1. Procesar bigramas
df_bigramas = df.select(
    col("url"),
    explode(split(col("bigramas"), r"\|")).alias("frase")
).withColumn("longitud", lit(2))

# 2. Procesar trigramas
df_trigramas = df.select(
    col("url"),
    explode(split(col("trigramas"), r"\|")).alias("frase")
).withColumn("longitud", lit(3))

# 3. Unir ambos DataFrames
df_ngrams_unified = df_bigramas.union(df_trigramas)

# 4. Unir con los pagina_id
df_ngrams_with_id = df_ngrams_unified.join(
    df_pagina.select("url", "pagina_id"),
    on="url",
    how="left"
)

# 5. Calcular frecuencia de cada n-grama por página
df_ngram_final = df_ngrams_with_id.groupBy("pagina_id", "frase", "longitud").agg(
    count("*").alias("frecuencia")
)





""" PARA DF_DISTRIBUCION_LONGITUD_PALABRA """

df_distribucion_longitud_palabra = (
    df
    # 1. Seleccionamos la columna de palabras del DataFrame original
    .select("palabras")

    # 2. Separamos la cadena usando "|" como delimitador y explotamos para tener cada palabra en una fila
    .withColumn("palabra", explode(split(col("palabras"), r"\|")))

    # 3. Eliminamos espacios en blanco en los extremos
    .withColumn("palabra", trim(col("palabra")))

    # 4. Filtramos posibles entradas vacías
    .filter(col("palabra") != "")

    # 5. Calculamos la longitud de cada palabra
    .withColumn("longitud", length(col("palabra")))

    # 6. Agrupamos por longitud y contamos la cantidad de palabras
    .groupBy("longitud")
    .agg(count("*").alias("frecuencia_total"))

    # 7. Ordenamos por la longitud para que la distribución sea más visual
    .orderBy("longitud")
)





""" PARA DF_COINCIDENCIA_BIGRAMAS """

# 1. Extraer y limpiar bigramas de df
df_bigrams = (
    df
    .select("url", explode(split(col("bigramas"), r"\|")).alias("bigrama_raw"))
    .withColumn(
        "bigrama",
        trim(
            regexp_replace(col("bigrama_raw"), "[^\\p{L}\\p{Nd} ]", "")
        )
    )
    .filter(
        (length(col("bigrama")) > 0) &
        (col("bigrama").contains(" "))        # obliga a que sea realmente un bigrama
    )
    .select("url", "bigrama")
)

# 2. Asignar pagina_id a cada bigrama
df_bigrams_id = (
    df_bigrams
    .join(df_pagina.select("url","pagina_id"), on="url", how="inner")
    .select("pagina_id", "bigrama")
    .distinct()
)

# 3. Agrupar bigramas en sets por página
df_bigrams_sets = (
    df_bigrams_id
    .groupBy("pagina_id")
    .agg(collect_set("bigrama").alias("bigramas_set"))
)

# 4. Asegurar que todas las páginas estén (sets vacíos si no tienen bigramas)
df_all_pages = df_pagina.select("pagina_id")

df_all_sets = (
    df_all_pages
    .join(df_bigrams_sets, on="pagina_id", how="left")
    .withColumn(
        "bigramas_set",
        coalesce(col("bigramas_set"), array())  # array() genera [] como Column
    )
)

# 5. Auto-join para obtener todas las combinaciones página_i < página_j
df_coincidencia_bigramas = (
    df_all_sets.alias("a")
    .join(
        df_all_sets.alias("b"),
        col("a.pagina_id") < col("b.pagina_id")
    )
    .select(
        col("a.pagina_id").alias("pagina_id_base"),
        col("b.pagina_id").alias("pagina_id_coincidente"),
        size(
            array_intersect("a.bigramas_set", "b.bigramas_set")
        ).alias("cantidad_bigramas_comunes")
    )
)





""" PARA DF_COINCIDENCIA_TRIGRAMAS """
# 1. Extraer y limpiar trigramas de df
df_trigrams = (
    df
    .select("url", explode(split(col("trigramas"), r"\|")).alias("trigrama_raw"))
    .withColumn(
        "trigrama",
        trim(regexp_replace(col("trigrama_raw"), "[^\\p{L}\\p{Nd} ]", ""))
    )
    .filter(
        (length(col("trigrama")) > 0) &
        (col("trigrama").contains(" "))  # Asegura que sea realmente un trigrama
    )
    .select("url", "trigrama")
)

# 2. Asignar pagina_id a cada trigrama
df_trigrams_id = (
    df_trigrams
    .join(df_pagina.select("url", "pagina_id"), on="url", how="inner")
    .select("pagina_id", "trigrama")
    .distinct()
)

# 3. Agrupar trigramas en sets por página
df_trigrams_sets = (
    df_trigrams_id
    .groupBy("pagina_id")
    .agg(collect_set("trigrama").alias("trigramas_set"))
)

# 4. Asegurar que todas las páginas tengan un set (vacío si no tienen trigramas)
df_all_pages = df_pagina.select("pagina_id")

df_all_sets_trigrams = (
    df_all_pages
    .join(df_trigrams_sets, on="pagina_id", how="left")
    .withColumn("trigramas_set", coalesce(col("trigramas_set"), array()))
)

# 5. Auto-join para obtener todas las combinaciones: pagina_id_base < pagina_id_coincidente
df_coincidencia_trigramas = (
    df_all_sets_trigrams.alias("a")
    .join(
        df_all_sets_trigrams.alias("b"),
        col("a.pagina_id") < col("b.pagina_id")
    )
    .select(
        col("a.pagina_id").alias("pagina_id_base"),
        col("b.pagina_id").alias("pagina_id_coincidente"),
        size(array_intersect("a.trigramas_set", "b.trigramas_set")).alias("cantidad_trigramas_comunes")
    )
)










""" HACER ARCHIVOS CSV """

## 🔹 FUNCIONES DE INSERCIÓN PARA TODOS LOS DATAFRAMES

def crearCSVs(df_pagina_enriched, df_palabra_pagina, df_porcentaje_palabra_pagina, df_ngram_final, df_distribucion_longitud_palabra, df_coincidencia_bigramas, df_coincidencia_trigramas):

    print("CREANDO PAGINA CSV...")
    df_pagina_enriched = df_pagina_enriched.fillna({'enlaces_entrantes': 0, 'pagerank': 0.0, 'longitud_promedio': 0.0})
    df_pagina_enriched.coalesce(1).write.option("header", True).csv(f"./CSVs/df_pagina.csv")

    print("CREANDO PALABRA PAGINA CSV...")
    df_palabra_pagina = df_palabra_pagina.fillna({'frecuencia': 0})
    df_palabra_pagina = df_palabra_pagina.filter(col("pagina_id").isNotNull())
    df_palabra_pagina.coalesce(1).write.option("header", True).csv(f"./CSVs/df_palabra_pagina.csv")

    print("CREANDO PORCENTAJE PALABRA CSV...")
    df_porcentaje_palabra_pagina = df_porcentaje_palabra_pagina.fillna({'porcentaje': 0})
    df_porcentaje_palabra_pagina = df_porcentaje_palabra_pagina.filter(col("pagina_id").isNotNull())
    df_porcentaje_palabra_pagina.coalesce(1).write.option("header", True).csv(f"./CSVs/df_porcentaje_palabra_pagina.csv")

    print("CREANDO NGRAM CSV...")
    df_ngram_final = df_ngram_final.fillna({'frecuencia': 0})
    df_ngram_final = df_ngram_final.filter(col("pagina_id").isNotNull())
    df_ngram_final.coalesce(1).write.option("header", True).csv(f"./CSVs/df_ngram.csv")

    print("CREANDO DISTRIBUCION LONGITUD CSV...")
    df_distribucion_longitud_palabra = df_distribucion_longitud_palabra.fillna({'frecuencia_total': 0})
    df_distribucion_longitud_palabra.coalesce(1).write.option("header", True).csv(f"./CSVs/df_distribucion_longitud_palabra.csv")

    print("CREANDO COINCIDENCIA BIGRAMAS CSV...")
    df_coincidencia_bigramas = df_coincidencia_bigramas.fillna({'cantidad_bigramas_comunes': 0})
    df_coincidencia_bigramas = df_coincidencia_bigramas.filter(col("pagina_id_base").isNotNull())
    df_coincidencia_bigramas = df_coincidencia_bigramas.filter(col("pagina_id_coincidente").isNotNull())
    df_coincidencia_bigramas = df_coincidencia_bigramas.filter(col("cantidad_bigramas_comunes") > 88)
    df_coincidencia_bigramas.coalesce(1).write.option("header", True).csv(f"./CSVs/df_coincidencia_bigramas.csv")

    print("CREANDO COINCIDENCIA TRIGRAMAS CSV...")
    df_coincidencia_trigramas = df_coincidencia_trigramas.fillna({'cantidad_trigramas_comunes': 0})
    df_coincidencia_trigramas = df_coincidencia_trigramas.filter(col("pagina_id_base").isNotNull())
    df_coincidencia_trigramas = df_coincidencia_trigramas.filter(col("pagina_id_coincidente").isNotNull())
    df_coincidencia_trigramas = df_coincidencia_trigramas.filter(col("cantidad_trigramas_comunes") > 70)
    df_coincidencia_trigramas.coalesce(1).write.option("header", True).csv(f"./CSVs/df_coincidencia_trigramas.csv")

# 🔹 EJECUCIÓN PRINCIPAL
try:
    crearCSVs(df_pagina_enriched, df_palabra_pagina, df_porcentaje_palabra_pagina, df_ngram_final, df_distribucion_longitud_palabra, df_coincidencia_bigramas, df_coincidencia_trigramas)
    
except Exception as e:
    print(f"❌ Error en el proceso principal: {e}")

finally:
    print("🔌 Procesamiento finalizado")