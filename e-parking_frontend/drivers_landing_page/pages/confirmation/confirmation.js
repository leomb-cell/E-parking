// Confirmação: busca a reserva salva no localStorage pelo id da URL e mostra os detalhes.

const reservationId = new URLSearchParams(location.search).get("id");
const reservation = reservationId ? findReservation(reservationId) : null;

if (reservation) {
  document.getElementById("code").textContent = reservation.code;
  document.getElementById("parkingName").textContent = reservation.parkingName;
  document.getElementById("address").textContent = reservation.address;
  document.getElementById("date").textContent = formatDate(reservation.date);
  document.getElementById("time").textContent = reservation.time;
  document.getElementById("hours").textContent = formatDuration(reservation.hours);
  document.getElementById("payment").textContent = reservation.paymentMethod;
  document.getElementById("total").textContent = formatCurrency(reservation.total);
  if (reservation.paymentMethod === "No local") {
    document.getElementById("totalLabel").textContent = "Total a pagar no local";
  }
} else {
  document.getElementById("reservationCard").hidden = true;
  document.getElementById("notFound").hidden = false;
}
