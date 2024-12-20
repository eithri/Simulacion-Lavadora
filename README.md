# Simulador de Ciclo de Lavado

Este proyecto es un simulador de los ciclos de lavado, enjuague y centrifugado de una lavadora, que permite simular el comportamiento de los filtros y el flujo de agua a lo largo de los tres ciclos. El proyecto está diseñado para interactuar con un usuario mediante una interfaz web, mostrando el agua procesada por cada filtro en tiempo real y generando un reporte al finalizar la simulación.

## Características

- **Simulación de tres ciclos de lavado:**
  - **Lavado:** Durante la primera mitad, el filtro A recibe agua, mientras que en la segunda mitad, el filtro B recibe agua.
  - **Enjuague:** Ambos filtros funcionan durante todo el ciclo.
  - **Centrifugado:** El filtro B recibe agua y elimina el agua almacenada
  
- **Interfaz interactiva:**
  - Permite al usuario definir los tiempos de los ciclos (lavado, enjuague, centrifugado) y el diámetro de la manguera.
  - Muestra en tiempo real los litros de agua procesados por cada filtro y el total de agua almacenada.
  
- **Reporte detallado:** 
  - Después de cada simulación, el usuario puede generar un reporte que muestra la cantidad de agua tratada por cada filtro y el agua almacenada durante los tres ciclos.
  
- **Unidades de medición:**
  - Los valores de agua procesada se muestran en mililitros para los filtros A y B.
  - El total de agua almacenada se muestra en litros.

## Instalación

Para usar el proyecto, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu_usuario/tu_repositorio.git


2. **Actualizar Dependencia:**
   ```bash
   npm install


1. **Iniciar el proyecto**
   ```bash
   node server.js

