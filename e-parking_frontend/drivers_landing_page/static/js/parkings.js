// Estacionamentos disponíveis. Na Sprint 3 esta lista virá da API do back-end.

const PARKINGS = [
  {
    id: "park-center",
    name: "Park Center",
    address: "Rua das Flores, 120 — Centro, Florianópolis",
    price: 18,
    rating: 4.8,
    spots: 8,
    features: ["24 horas", "Acessível", "Coberto", "Segurança 24h"],
    description: "O Park Center oferece vagas para motoristas que desejam estacionar com praticidade e segurança próximo ao centro de Florianópolis. Funciona 24 horas e possui vagas cobertas, acessibilidade e sistema de segurança."
  },
  {
    id: "centro-park",
    name: "Centro Park",
    address: "Avenida Central, 450 — Centro, Florianópolis",
    price: 15,
    rating: 4.6,
    spots: 12,
    features: ["06h às 00h", "Coberto"],
    description: "O Centro Park fica a poucos minutos das principais ruas comerciais do centro. Tem vagas cobertas e funciona das 6h à meia-noite."
  },
  {
    id: "park-sul",
    name: "Park Sul",
    address: "Rua do Comércio, 85 — Centro, Florianópolis",
    price: 16,
    rating: 4.7,
    spots: 5,
    features: ["24 horas", "Segurança 24h"],
    description: "O Park Sul é uma opção econômica e aberta 24 horas, com monitoramento por câmeras e equipe de segurança durante todo o dia."
  },
  {
    id: "beira-mar-parking",
    name: "Beira-Mar Parking",
    address: "Avenida Beira-Mar Norte, 1200 — Centro, Florianópolis",
    price: 20,
    rating: 4.9,
    spots: 3,
    features: ["24 horas", "Acessível", "Coberto", "Segurança 24h"],
    description: "O Beira-Mar Parking fica de frente para a Avenida Beira-Mar Norte. Tem vagas cobertas, acessíveis e segurança 24 horas."
  },
  {
    id: "praca-xv",
    name: "Estacionamento Praça XV",
    address: "Rua Felipe Schmidt, 300 — Centro, Florianópolis",
    price: 12,
    rating: 4.3,
    spots: 15,
    features: ["07h às 22h", "Acessível"],
    description: "Ao lado da Praça XV de Novembro, é a opção mais barata da região central. Funciona das 7h às 22h e tem vagas acessíveis."
  }
];

function findParking(id) {
  return PARKINGS.find(parking => parking.id === id) || null;
}

function ratingLabel(rating) {
  if (rating >= 4.7) return "Excelente avaliação";
  if (rating >= 4.5) return "Muito bem avaliado";
  return "Bem avaliado";
}
