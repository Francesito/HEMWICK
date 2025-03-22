// data/simulatedData.js
export const simulatedData = [
    {
      time: '2020',
      cases: 500000,
      fingerStrength: 15,
      tiltAngle: 20,
      rehabPercentage: 30,
    },
    {
      time: '2021',
      cases: 750000,
      fingerStrength: 18,
      tiltAngle: 25,
      rehabPercentage: 35,
    },
    {
      time: '2022',
      cases: 900000,
      fingerStrength: 20,
      tiltAngle: 30,
      rehabPercentage: 40,
    },
    {
      time: '2023',
      cases: 1200000,
      fingerStrength: 22,
      tiltAngle: 35,
      rehabPercentage: 45,
    },
    {
      time: '2024',
      cases: 1500000,
      fingerStrength: 25,
      tiltAngle: 40,
      rehabPercentage: 50,
    },
  ];
  
  // Función para calcular datos mejorados tras usar Smart Glove
  export const calculateImprovedData = (data) => {
    return data.map((item) => {
      // Suposiciones: Smart Glove mejora la fuerza en un 40%, inclinación en un 30%, y rehabilitación en un 25%
      const improvedFingerStrength = Math.min(Number((item.fingerStrength * 1.4).toFixed(1)), 50); // 1 decimal
      const improvedTiltAngle = Math.min(Number((item.tiltAngle * 1.3).toFixed(1)), 90); // 1 decimal
      const improvedRehabPercentage = Math.min(Math.round(item.rehabPercentage + 25), 95); // Entero
      
      return {
        ...item,
        improvedFingerStrength,
        improvedTiltAngle,
        improvedRehabPercentage,
      };
    });
  };
  
  export const improvedData = calculateImprovedData(simulatedData);