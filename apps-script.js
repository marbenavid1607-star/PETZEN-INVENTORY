// ID de la hoja de cálculo - CAMBIA ESTO CON TU ID
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID'; // Lo obtendrás después de crear el Sheet
const EMAIL_REMITENTE = 'mebb1607@gmail.com';

// Función principal que recibe los datos del formulario
function doPost(e) {
  try {
    // Parsear datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Abrir la hoja de cálculo
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pedidosSheet = sheet.getSheetByName('Pedidos');
    
    // Crear fila con datos
    const fecha = new Date();
    const numeroOrden = 'PTZ-' + Date.now();
    
    const nuevaFila = [
      fecha,
      numeroOrden,
      data.nombre,
      data.telefono,
      data.correo,
      data.items,
      data.total,
      data.entrega,
      data.pago,
      'Pendiente'
    ];
    
    // Agregar fila a la hoja
    pedidosSheet.appendRow(nuevaFila);
    
    // Enviar email de confirmación al cliente
    enviarEmailCliente(data, numeroOrden);
    
    // Enviar notificación al admin
    enviarEmailAdmin(data, numeroOrden);
    
    // Retornar respuesta exitosa
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      mensaje: 'Pedido registrado correctamente',
      numeroOrden: numeroOrden
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para enviar email al cliente
function enviarEmailCliente(data, numeroOrden) {
  const asunto = `✅ Pedido Confirmado - PETZEN ${numeroOrden}`;
  
  const cuerpo = `
    <h2>¡Gracias por tu compra! 🐾</h2>
    
    <p>Hola <strong>${data.nombre}</strong>,</p>
    
    <p>Tu pedido ha sido registrado exitosamente en nuestro sistema.</p>
    
    <h3>Detalles del Pedido:</h3>
    <ul>
      <li><strong>Número de Orden:</strong> ${numeroOrden}</li>
      <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</li>
      <li><strong>Total:</strong> $${data.total}</li>
      <li><strong>Entrega:</strong> ${data.entrega === 'domicilio' ? 'A domicilio' : 'Recoger en tienda'}</li>
      <li><strong>Método de Pago:</strong> ${data.pago === 'tarjeta' ? 'Tarjeta' : data.pago === 'transferencia' ? 'Transferencia' : 'Efectivo'}</li>
    </ul>
    
    <h3>Productos:</h3>
    <p>${data.items}</p>
    
    <h3>Próximos Pasos:</h3>
    <ol>
      <li>Recibirás una llamada de confirmación en el teléfono: <strong>${data.telefono}</strong></li>
      <li>Se procesará tu pago</li>
      <li>Tu pedido será preparado y entregado</li>
    </ol>
    
    <p>Si tienes preguntas, contáctanos:</p>
    <ul>
      <li>📞 +52 55 1234 5678</li>
      <li>✉ contacto@petzen.com</li>
      <li>📍 Ciudad de México</li>
    </ul>
    
    <p>¡Gracias por confiar en PETZEN! 🐕🐱</p>
  `;
  
  GmailApp.sendEmail(data.correo, asunto, '', {
    htmlBody: cuerpo,
    from: EMAIL_REMITENTE
  });
}

// Función para enviar notificación al admin
function enviarEmailAdmin(data, numeroOrden) {
  const asunto = `📦 Nuevo Pedido - ${numeroOrden}`;
  
  const cuerpo = `
    <h2>Nuevo Pedido Registrado</h2>
    
    <h3>Cliente:</h3>
    <p>${data.nombre} - ${data.correo} - ${data.telefono}</p>
    
    <h3>Detalles:</h3>
    <ul>
      <li><strong>Número Orden:</strong> ${numeroOrden}</li>
      <li><strong>Total:</strong> $${data.total}</li>
      <li><strong>Entrega:</strong> ${data.entrega}</li>
      <li><strong>Pago:</strong> ${data.pago}</li>
    </ul>
    
    <h3>Productos:</h3>
    <p>${data.items}</p>
    
    <p><a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}">Ver en Google Sheets</a></p>
  `;
  
  GmailApp.sendEmail(EMAIL_REMITENTE, asunto, '', {
    htmlBody: cuerpo
  });
}