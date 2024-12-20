// Referencias a los elementos del DOM
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const clearButton = document.getElementById("clearButton");
const reportButton = document.getElementById("reportButton");

const washTimeInput = document.getElementById("washTime");
const rinseTimeInput = document.getElementById("rinseTime");
const spinTimeInput = document.getElementById("spinTime");
const hoseDiameterInput = document.getElementById("hoseDiameter");

const totalCycleTimeField = document.getElementById("totalCycleTime");
const outputTimeField = document.getElementById("outputTime");
const waterStoredField = document.getElementById("waterStored");

const currentCycleField = document.getElementById("currentCycle");
const currentFilterField = document.getElementById("currentFilter");

// Variables de estado
let interval = null;
let isRunning = false;
let storedWater = 0;
let waterUsage = [0, 0, 0]; // Agua utilizada por cada ciclo
let filterAUsage = 0;
let filterBUsage = 0;

// Función para calcular el flujo de agua en función del diámetro de la manguera, la presión y el tiempo
function calculateWaterFlow(diameter, pressure, timeInSeconds) {
    // Convertir presión de psi a Pa (Pascal)
    const pressurePa = pressure * 6894.76; // Conversión de psi a Pa (1 psi = 6894.76 Pa)
    const area = Math.PI * Math.pow(diameter / 2, 2); // Área de la manguera en m^2

    // Calcular el caudal usando la fórmula Q = A * sqrt(2 * P / rho) (simplificada)
    const flowRate = area * Math.sqrt((2 * pressurePa) / 1000); // L/s

    // Calcular el volumen de agua ingresado
    const volume = flowRate * timeInSeconds; // Litros (caudal * tiempo)
    return volume;
}

function calculateTotalCycleTime() {
    const washTime = parseInt(washTimeInput.value) || 0;
    const rinseTime = parseInt(rinseTimeInput.value) || 0;
    const spinTime = parseInt(spinTimeInput.value) || 0;
    return washTime + rinseTime + spinTime; // Tiempo total en segundos
}

const cycles = ["Lavado", "Enjuague", "Centrifugado"];
const filters = ["Filtro A", "Ambos Filtros", "Filtro B"];

// Función para ajustar el uso de agua para el ciclo total entre 42 y 62 litros
function adjustWaterUsage() {
    const totalWaterRange = [42, 62]; // Rango entre 42 y 62 litros
    const totalCycleTime = calculateTotalCycleTime();
    const timeFraction = totalCycleTime / 3600; // Convertir el tiempo total en horas
    const totalWater = totalWaterRange[0] + (Math.random() * (totalWaterRange[1] - totalWaterRange[0])); // Litros totales de agua (Aleatorio en el rango)

    // Calcular el consumo de agua por fase
    const washFraction = 0.5; // 50% del agua para lavado
    const rinseFraction = 0.3; // 30% del agua para enjuague
    const spinFraction = 0.2; // 20% del agua para centrifugado

    const waterForWash = totalWater * washFraction;
    const waterForRinse = totalWater * rinseFraction;
    const waterForSpin = totalWater * spinFraction;

    return { totalWater, waterForWash, waterForRinse, waterForSpin };
}

function startCycle() {
    if (isRunning) return;
    isRunning = true;

    const washTime = parseInt(washTimeInput.value) || 0;
    const rinseTime = parseInt(rinseTimeInput.value) || 0;
    const spinTime = parseInt(spinTimeInput.value) || 0;

    const hoseDiameter = parseFloat(hoseDiameterInput.value) || 2; // El diámetro de la manguera en cm
    const cycleDurations = [washTime, rinseTime, spinTime].map(time => time * 1000);
    const totalCycleTime = calculateTotalCycleTime();
    totalCycleTimeField.value = `${totalCycleTime} segundos`;

    // Ajustar el uso de agua para que esté en el rango de 42 a 62 litros
    const { totalWater, waterForWash, waterForRinse, waterForSpin } = adjustWaterUsage();

    let cycleIndex = 0;
    const startTime = performance.now();

    let filterAUsage = 0;
    let filterBUsage = 0;
    let storedWater = 0; // El valor de agua almacenada empieza en 0

    interval = setInterval(() => {
        const elapsedTotalTime = performance.now() - startTime;

        // Actualizar tiempo total del ciclo en formato mm:ss:ms
        const totalMinutes = Math.floor(elapsedTotalTime / 60000);
        const totalSeconds = Math.floor((elapsedTotalTime % 60000) / 1000);
        const totalMilliseconds = Math.floor(elapsedTotalTime % 1000);
        totalCycleTimeField.value = `${String(totalMinutes).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}:${String(totalMilliseconds).padStart(3, "0")}`;

        // Tiempo transcurrido del ciclo actual
        const elapsedCycleStartTime = elapsedTotalTime - cycleDurations.slice(0, cycleIndex).reduce((a, b) => a + b, 0);
        outputTimeField.value = `${(elapsedCycleStartTime / 1000).toFixed(2)} seg`;

        // Usar los volúmenes ajustados de agua
        if (elapsedTotalTime >= cycleDurations.slice(0, cycleIndex).reduce((a, b) => a + b, 0)) {
            if (cycleIndex === 0) {
                // En el ciclo de lavado, en la primera mitad, el filtro A recibe agua
                const halfCycleDuration = cycleDurations[cycleIndex] / 2;

                if (elapsedCycleStartTime <= halfCycleDuration) {
                    // En la primera mitad del lavado, solo filtro A recibe agua
                    filterAUsage = (elapsedCycleStartTime / halfCycleDuration) * waterForWash; // Agua en filtro A
                    document.getElementById("filterA").value = `${(filterAUsage * 1000).toFixed(2)} ml`; // Convertir de L a ml y mostrar unidad
                } else {
                    // En la segunda mitad del lavado, filtro B recibe agua
                    const elapsedSecondHalf = elapsedCycleStartTime - halfCycleDuration;
                    filterAUsage = waterForWash / 2; // La mitad del agua va por filtro A
                    filterBUsage = (elapsedSecondHalf / halfCycleDuration) * (waterForWash / 2); // La mitad del agua va por filtro B
                    document.getElementById("filterA").value = `${(filterAUsage * 1000).toFixed(2)} ml`; // Filtro A
                    document.getElementById("filterB").value = `${(filterBUsage * 1000).toFixed(2)} ml`; // Filtro B
                }

            } else if (cycleIndex === 1) {
                // En el ciclo de enjuague, ambos filtros funcionan todo el tiempo
                filterAUsage = (elapsedCycleStartTime / cycleDurations[cycleIndex]) * waterForRinse; // Agua en filtro A
                filterBUsage = (elapsedCycleStartTime / cycleDurations[cycleIndex]) * waterForRinse; // Agua en filtro B
                document.getElementById("filterA").value = `${(filterAUsage * 1000).toFixed(2)} ml`; // Filtro A
                document.getElementById("filterB").value = `${(filterBUsage * 1000).toFixed(2)} ml`; // Filtro B
            } else if (cycleIndex === 2) {
                // En el ciclo de centrifugado, ambos filtros siguen funcionando
                const halfCycleDuration = cycleDurations[cycleIndex] / 2;

                if (elapsedCycleStartTime <= halfCycleDuration) {
                    // En la primera mitad del centrifugado, solo filtro A recibe agua
                    filterAUsage = (elapsedCycleStartTime / halfCycleDuration) * waterForSpin; // Agua en filtro A
                    document.getElementById("filterA").value = `${(filterAUsage * 1000).toFixed(2)} ml`; // Filtro A
                } else {
                    // En la segunda mitad del centrifugado, filtro A y B reciben agua
                    const elapsedSecondHalf = elapsedCycleStartTime - halfCycleDuration;
                    filterAUsage = waterForSpin / 2; // La mitad del agua va por filtro A
                    filterBUsage = (elapsedSecondHalf / halfCycleDuration) * (waterForSpin / 2); // La mitad del agua va por filtro B
                    document.getElementById("filterA").value = `${(filterAUsage * 1000).toFixed(2)} ml`; // Filtro A
                    document.getElementById("filterB").value = `${(filterBUsage * 1000).toFixed(2)} ml`; // Filtro B
                }
            }

            // Calcular agua almacenada: agua que entra por el filtro A menos agua que sale por el filtro B
            storedWater = Math.max(0, storedWater + filterAUsage - filterBUsage); // Asegurarse que nunca sea menor a 0
            waterStoredField.value = `${storedWater.toFixed(2)} litros`; // Mostrar agua almacenada en litros

            // Cambiar de ciclo si se completó el tiempo
            if (elapsedCycleStartTime >= cycleDurations[cycleIndex]) {
                cycleIndex++;

                // No resetear el valor de agua almacenada cuando se cambia de ciclo, solo continuar acumulando
                if (cycleIndex >= cycles.length) {
                    clearInterval(interval);
                    isRunning = false;
                    alert("Ciclo completado");
                    return;
                }
            }

            // Actualizar ciclo actual y filtro
            currentCycleField.value = cycles[cycleIndex] || "";
            currentFilterField.value = filters[cycleIndex] || "";
        }
    }, 20);
}

// Función para detener el ciclo
function stopCycle() {
    if (interval) {
        clearInterval(interval);
        isRunning = false;
    }
}

// Función para limpiar los campos
function clearFields() {
    stopCycle();
    totalCycleTimeField.value = "";
    outputTimeField.value = "";
    waterStoredField.value = "";
    currentCycleField.value = "";
    currentFilterField.value = "";
    filterAUsage = 0; // Resetear filtro A
    filterBUsage = 0; // Resetear filtro B
    storedWater = 0;
    waterUsage = [0, 0, 0];
    document.getElementById("filterA").value = "";
    document.getElementById("filterB").value = "";

    // Limpiar inputs de configuración
    washTimeInput.value = "";
    rinseTimeInput.value = "";
    spinTimeInput.value = "";
    hoseDiameterInput.value = "";
}

// Función para mostrar el reporte
function showReport() {
    const reportDialog = document.createElement("div");
    reportDialog.classList.add("modal", "fade");
    reportDialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Reporte del Sistema</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ciclo</th>
                                <th>Agua Ingresada (L)</th>
                                <th>Agua Almacenada (L)</th>
                                <th>Agua Salida (L)</th>
                                <th>Total Agua Usada (L)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cycles.map((cycle, index) => `
                                <tr>
                                    <td>${cycle}</td>
                                    <td>${waterUsage[index].toFixed(2)}</td>
                                    <td>${storedWater.toFixed(2)}</td>
                                    <td>${(waterUsage[index] - storedWater).toFixed(2)}</td>
                                    <td>${(waterUsage[index] + storedWater).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(reportDialog);
    const modal = new bootstrap.Modal(reportDialog);
    modal.show();
}

// Asignación de eventos
startButton.addEventListener("click", startCycle);
stopButton.addEventListener("click", stopCycle);
clearButton.addEventListener("click", clearFields);
reportButton.addEventListener("click", showReport);
