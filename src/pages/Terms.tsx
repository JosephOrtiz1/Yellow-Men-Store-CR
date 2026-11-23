const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="font-heading text-2xl md:text-3xl tracking-wider text-primary mt-10 mb-4">{title}</h2>
    <div className="space-y-4 text-sm md:text-base text-muted-foreground font-body leading-relaxed">{children}</div>
  </section>
);

const Sub = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-heading text-lg md:text-xl tracking-wider text-foreground mt-6 mb-2">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Terms = () => (
  <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
    <header className="mb-8">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wider">TÉRMINOS Y CONDICIONES</h1>
      <p className="text-muted-foreground font-body text-sm mt-3">
        Documentación legal de Yellow Men Store — Sitio web: https://yellowmenstore.app/
      </p>
      <p className="text-muted-foreground font-body text-sm">Última actualización: Noviembre de 2026</p>
    </header>

    <nav className="border border-border rounded-lg p-4 mb-4 bg-secondary/40">
      <p className="font-heading tracking-wider text-primary mb-2">CONTENIDO</p>
      <ul className="space-y-1 text-sm font-body">
        <li><a href="#terminos" className="text-blue-500 hover:underline">1. Términos y condiciones de uso y compra</a></li>
        <li><a href="#devoluciones" className="text-blue-500 hover:underline">2. Política de devoluciones, cambios y garantías</a></li>
        <li><a href="#privacidad" className="text-blue-500 hover:underline">3. Política de privacidad y protección de datos personales</a></li>
        <li><a href="#cookies" className="text-blue-500 hover:underline">4. Política de cookies y tecnologías de almacenamiento local</a></li>
      </ul>
    </nav>

    <Section id="terminos" title="1. TÉRMINOS Y CONDICIONES DE USO Y COMPRA">
      <Sub title="1.1. Identificación del Comerciante y Aceptación">
        <p>
          El presente sitio web <strong className="text-foreground">https://yellowmenstore.app/</strong> (en adelante, la "Plataforma") es operado bajo la denominación comercial <strong className="text-foreground">Yellow Men Store</strong>, con número de identificación <strong className="text-foreground">1-1913-0123</strong>, domicilio en <strong className="text-foreground">San José, Costa Rica</strong>, correo electrónico de contacto <strong className="text-foreground">josephortiz1008@gmail.com</strong> y teléfono/WhatsApp <strong className="text-foreground">+506 6488-3639</strong>.
        </p>
        <p>
          Al navegar, registrarse, agregar artículos al carrito o realizar una compra en la Plataforma, el usuario (en adelante, el "Consumidor") acepta de manera expresa e inequívoca estos Términos y Condiciones, reconociendo plena validez jurídica y fuerza probatoria a las transacciones electrónicas conforme a la <strong className="text-foreground">Ley N.° 8454 (Ley de Certificados, Firmas Digitales y Documentos Electrónicos)</strong> de la República de Costa Rica. Si el Consumidor no está de acuerdo con estas disposiciones, deberá abstenerse de utilizar la Plataforma.
        </p>
      </Sub>

      <Sub title="1.2. Capacidad Legal y Registro de Cuenta">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Mayoría de edad:</strong> Las compras en la Plataforma están dirigidas exclusivamente a personas mayores de 18 años con capacidad legal para contratar conforme al Código Civil de Costa Rica.</li>
          <li><strong className="text-foreground">Cuenta de usuario:</strong> Para agilizar compras y consultar el estado de pedidos, el Consumidor puede crear una cuenta en la sección "Cuenta". El Consumidor es responsable de la veracidad de los datos suministrados y de la confidencialidad de sus credenciales de acceso. Yellow Men Store podrá suspender o cancelar cuentas ante usos fraudulentos, suplantación de identidad o incumplimiento de estos términos.</li>
        </ul>
      </Sub>

      <Sub title="1.3. Catálogo, Precios y Disponibilidad">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Información veraz:</strong> Conforme al artículo 34 de la <strong className="text-foreground">Ley N.° 7472</strong> y el Capítulo X del <strong className="text-foreground">Decreto Ejecutivo N.° 37899-MEIC</strong>, cada producto exhibe su descripción, fotografías de referencia, tallas disponibles y precio total.</li>
          <li><strong className="text-foreground">Moneda e impuestos:</strong> Todos los precios están expresados en <strong className="text-foreground">Colones Costarricenses (₡)</strong> e incluyen el Impuesto sobre el Valor Agregado (IVA), salvo que se indique expresamente lo contrario antes de finalizar el pago. Los costos de envío se detallan por separado en el resumen del <strong className="text-foreground">Carrito</strong> antes de confirmar la compra.</li>
          <li><strong className="text-foreground">Disponibilidad de inventario:</strong> La exhibición de prendas en el catálogo está sujeta a disponibilidad real. En caso de que, tras confirmarse un pedido, ocurra un quiebre de inventario imprevisto, se notificará al Consumidor en un plazo máximo de <strong className="text-foreground">48 horas hábiles</strong> para ofrecerle el cambio por otra prenda de igual valor o el reembolso íntegro inmediato del dinero pagado.</li>
        </ul>
      </Sub>

      <Sub title="1.4. Proceso de Compra, Pagos y Comprobante Electrónico">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Perfeccionamiento del contrato:</strong> La compra se perfecciona una vez que el Consumidor revisa su carrito, acepta estos términos, completa el pago y recibe la confirmación del pedido.</li>
          <li><strong className="text-foreground">Medios de pago:</strong> Se aceptan los métodos habilitados en la pasarela de pago de la Plataforma (tarjetas de débito/crédito, SINPE Móvil o transferencia bancaria, según disponibilidad). Conforme a la normativa costarricense, <strong className="text-foreground">no se aplican recargos adicionales</strong> por el pago con tarjeta de crédito o débito.</li>
          <li><strong className="text-foreground">Facturación:</strong> Yellow Men Store emitirá el comprobante electrónico correspondiente (Factura Electrónica o Tiquete Electrónico autorizado por el Ministerio de Hacienda) y lo enviará al correo electrónico registrado por el Consumidor.</li>
        </ul>
      </Sub>

      <Sub title="1.5. Entregas y Envíos">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Cobertura y plazos:</strong> Se realizan envíos dentro del territorio de la República de Costa Rica mediante mensajería privada o Correos de Costa Rica. Los plazos estimados de entrega (usualmente entre 1 y 5 días hábiles según la zona dentro o fuera del GAM) se informarán antes de concretar el pago.</li>
          <li><strong className="text-foreground">Responsabilidad en el traslado:</strong> Yellow Men Store asume la responsabilidad por pérdida o daño del paquete durante el transporte hasta su entrega efectiva en la dirección indicada por el Consumidor. Es obligación del Consumidor suministrar una dirección exacta y un número telefónico activo para coordinar la recepción.</li>
        </ul>
      </Sub>

      <Sub title="1.6. Propiedad Intelectual">
        <p>
          El diseño de la Plataforma, código fuente, logotipos, marca <strong className="text-foreground">"Yellow Men Store"</strong>, textos, fotografías de prendas, gráficos y la selección de estilos (<em>Street Wear, Techwear, Old Money, Japan Style, Darkwear, Casual</em>) están protegidos por la <strong className="text-foreground">Ley N.° 6683 (Ley de Derechos de Autor y Derechos Conexos)</strong> y la <strong className="text-foreground">Ley N.° 7978 (Ley de Marcas y Otros Signos Distintivos)</strong>. Queda prohibida su reproducción, distribución o uso comercial sin autorización previa y por escrito.
        </p>
      </Sub>

      <Sub title="1.7. Limitación de Responsabilidad y Enlaces Externos">
        <p>
          La Plataforma puede contener enlaces a redes sociales externas (como Instagram <strong className="text-foreground">@yellowmenstore</strong>). Yellow Men Store no controla ni asume responsabilidad por las políticas de privacidad o fallos técnicos de plataformas de terceros. Asimismo, aunque se aplican medidas técnicas para la disponibilidad continua del sitio, no se garantiza la ausencia absoluta de interrupciones por mantenimiento o fuerza mayor.
        </p>
      </Sub>

      <Sub title="1.8. Legislación Aplicable y Resolución de Conflictos">
        <p>
          Estos Términos se rigen por las leyes de la República de Costa Rica. Para cualquier consulta, queja o reclamo, el Consumidor podrá contactar directamente a Yellow Men Store a través del WhatsApp <strong className="text-foreground">+506 6488-3639</strong> o al correo <strong className="text-foreground">correo@yellowmenstore.app</strong>. Asimismo, el Consumidor conserva intacto su derecho de acudir ante la <strong className="text-foreground">Comisión Nacional del Consumidor (CNC)</strong> del Ministerio de Economía, Industria y Comercio (MEIC) o ante los tribunales de justicia de Costa Rica.
        </p>
      </Sub>
    </Section>

    <Section id="devoluciones" title="2. POLÍTICA DE DEVOLUCIONES, CAMBIOS Y GARANTÍAS">
      <p>
        De conformidad con la <strong className="text-foreground">Ley N.° 7472 (Ley de Promoción de la Competencia y Defensa Efectiva del Consumidor)</strong> y su Reglamento (<strong className="text-foreground">Decreto Ejecutivo N.° 37899-MEIC</strong>):
      </p>

      <Sub title="2.1. Derecho de Retracto (Compras en Línea)">
        <p>
          Conforme al artículo 130 del Reglamento a la Ley N.° 7472 (y normativa aplicable a ventas a distancia y comercio electrónico), el Consumidor tiene derecho a rescindir el contrato de compra sin responsabilidad y sin necesidad de justificación dentro de los <strong className="text-foreground">ocho (8) días hábiles</strong> siguientes al perfeccionamiento de la venta o recepción del producto.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Condiciones:</strong> La prenda debe devolverse sin uso, sin lavar, sin olores (perfume, humo, sudor), con todas sus etiquetas originales adheridas y en su empaque original.</li>
          <li><strong className="text-foreground">Procedimiento y reembolso:</strong> El Consumidor deberá notificar su decisión dentro del plazo de 8 días hábiles al WhatsApp <strong className="text-foreground">+506 6488-3639</strong> o al correo <strong className="text-foreground">correo@yellowmenstore.app</strong> indicando su número de pedido. Una vez recibida y verificada la prenda, Yellow Men Store reembolsará la totalidad de lo pagado por el producto por el mismo medio utilizado para el pago en un plazo máximo de <strong className="text-foreground">8 días hábiles</strong>. <em>(Nota: Los gastos de envío de devolución por retracto voluntario correrán por cuenta del Consumidor, salvo error atribuible a la tienda).</em></li>
        </ul>
      </Sub>

      <Sub title="2.2. Cambios por Talla o Estilo">
        <p>
          Adicionalmente al derecho de retracto, Yellow Men Store permite solicitar cambios de talla o de prenda dentro de los <strong className="text-foreground">15 días naturales</strong> posteriores a la entrega, sujeto a disponibilidad de inventario y siempre que la prenda conserve sus etiquetas y estado original (sin uso ni lavado). Los costos de mensajería asociados al cambio de talla corren por cuenta del Consumidor.
        </p>
      </Sub>

      <Sub title="2.3. Garantía Legal por Defectos de Fábrica">
        <p>
          De acuerdo con el artículo 43 de la <strong className="text-foreground">Ley N.° 7472</strong>, todas las prendas y accesorios cuentan con una <strong className="text-foreground">garantía legal mínima obligatoria de treinta (30) días hábiles</strong> contados a partir de la fecha de entrega del producto.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Cobertura:</strong> Cubre defectos de fabricación, fallas en costuras, cremalleras, broches, decoloración anormal en el primer lavado (siguiendo las instrucciones de la etiqueta) o envío de un artículo distinto al solicitado.</li>
          <li><strong className="text-foreground">Exclusiones:</strong> La garantía no cubre daños causados por mal uso, lavado inadecuado contrario a las instrucciones de cuidado, rasgaduras accidentales o desgaste normal por uso.</li>
          <li><strong className="text-foreground">Ejecución:</strong> Ante un defecto cubierto, el Consumidor podrá optar por la reparación (si aplica), el cambio por una prenda nueva igual o equivalente, o la devolución íntegra del dinero pagado (incluidos los gastos de envío). Yellow Men Store responderá a cualquier solicitud de garantía en un plazo máximo de <strong className="text-foreground">10 días hábiles</strong>.</li>
        </ul>
      </Sub>

      <Sub title="2.4. Excepciones por Higiene">
        <p>
          Por razones de higiene y salud pública, no se aceptan cambios ni devoluciones por retracto en ropa interior, medias o accesorios de contacto íntimo, salvo que presenten defectos de fábrica cubiertos por la garantía legal.
        </p>
      </Sub>
    </Section>

    <Section id="privacidad" title="3. POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES">
      <p>
        En estricto cumplimiento de la <strong className="text-foreground">Ley N.° 8968 (Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales)</strong> y su Reglamento (<strong className="text-foreground">Decreto Ejecutivo N.° 37554-JP</strong>), se informa a los usuarios lo siguiente:
      </p>

      <Sub title="3.1. Responsable de la Base de Datos">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Responsable:</strong> Yellow Men Store (Identificación N.° 1-1913-0123)</li>
          <li><strong className="text-foreground">Domicilio:</strong> San José, Costa Rica</li>
          <li><strong className="text-foreground">Teléfono / WhatsApp:</strong> +506 6488-3639</li>
          <li><strong className="text-foreground">Contacto para derechos ARCO:</strong> correo@yellowmenstore.app</li>
        </ul>
      </Sub>

      <Sub title="3.2. Datos Recolectados y Finalidad del Tratamiento">
        <p>
          Para operar las funciones de <strong className="text-foreground">Cuenta</strong>, <strong className="text-foreground">Carrito</strong>, facturación y envíos, Yellow Men Store recolecta únicamente datos personales de acceso restringido necesarios para la relación comercial (nombre completo, número de identificación para facturación electrónica, correo electrónico, número telefónico y dirección exacta de entrega). <strong className="text-foreground">No recolectamos datos sensibles</strong> (salud, ideología, religión, origen racial o preferencias sexuales).
        </p>
        <p>Los datos se utilizan exclusivamente para:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Gestionar el registro y autenticación de la cuenta de usuario.</li>
          <li>Procesar pedidos, pagos y emitir comprobantes electrónicos ante el Ministerio de Hacienda.</li>
          <li>Coordinar la entrega logística de los productos adquiridos.</li>
          <li>Atender consultas, cambios, garantías o ejercicio del derecho de retracto.</li>
          <li>Enviar promociones o novedades únicamente si el usuario ha otorgado su <strong className="text-foreground">consentimiento previo, expreso e inequívoco</strong> (casilla <em>opt-in</em> desmarcada por defecto).</li>
        </ol>
      </Sub>

      <Sub title="3.3. Carácter Obligatorio o Facultativo y Consecuencias">
        <p>
          El suministro de los datos marcados como obligatorios en el formulario de compra o registro es indispensable para procesar el pedido y emitir la factura electrónica. La negativa a suministrarlos impedirá concretar la compra o el envío. Los datos para fines promocionales son estrictamente facultativos.
        </p>
      </Sub>

      <Sub title="3.4. Transferencia a Terceros y Encargados Tecnológicos">
        <p>
          Yellow Men Store <strong className="text-foreground">no vende, alquila ni comercializa</strong> bases de datos personales. Conforme al Reglamento de la Ley N.° 8968, el traslado de datos necesarios hacia proveedores de servicios tecnológicos (hosting, pasarelas de pago) o empresas de mensajería para completar la entrega constituye un encargo de tratamiento bajo estricta confidencialidad y secreto profesional, y no una transferencia comercial.
        </p>
      </Sub>

      <Sub title="3.5. Analítica de Visitantes">
        <p>
          Esta Plataforma utiliza la analítica de visitantes de <strong className="text-foreground">Lovable</strong>, que <strong className="text-foreground">no usa cookies, no almacena nada en el dispositivo del visitante, no conserva direcciones IP y no identifica a los visitantes</strong>. Lovable recolecta estos datos por nosotros. La <a href="https://lovable.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">política de privacidad de Lovable</a> explica cómo los maneja.
        </p>
        <p>
          Para cada visitante se registran, sin cookies y sin identificar a nadie: las páginas visitadas, de dónde llegó el visitante, su país, navegador, sistema operativo y tipo de dispositivo, cuánto tiempo permanece, qué tan rápido cargan las páginas, los errores que ocurren y los clics en botones y enlaces. Los datos detallados se conservan durante <strong className="text-foreground">90 días</strong> y los resúmenes diarios durante <strong className="text-foreground">un año</strong>.
        </p>
      </Sub>

      <Sub title="3.6. Seguridad y Conservación de los Datos">
        <p>
          Implementamos medidas técnicas y organizativas acordes con el desarrollo tecnológico (cifrado SSL/HTTPS, control de accesos y almacenamiento seguro) para evitar la pérdida, alteración o acceso no autorizado a la información. Los datos se conservarán durante la vigencia de la relación comercial y el plazo legal exigido por la normativa tributaria costarricense (mínimo 5 años para respaldos contables y facturación).
        </p>
      </Sub>

      <Sub title="3.7. Derechos del Titular (Acceso, Rectificación, Cancelación y Oposición)">
        <p>
          El usuario puede ejercer en cualquier momento y de forma <strong className="text-foreground">gratuita</strong> sus derechos de acceso, rectificación, actualización, revocación del consentimiento o eliminación de sus datos personales enviando una solicitud a <strong className="text-foreground">correo@yellowmenstore.app</strong> o mediante contacto directo al <strong className="text-foreground">+506 6488-3639</strong>. Yellow Men Store resolverá la solicitud dentro del plazo legal de <strong className="text-foreground">cinco (5) días hábiles</strong> contados a partir de su recepción. En caso de inconformidad, el usuario puede acudir ante la <strong className="text-foreground">Agencia de Protección de Datos de los Habitantes (PRODHAB)</strong>.
        </p>
      </Sub>
    </Section>

    <Section id="cookies" title="4. POLÍTICA DE COOKIES Y TECNOLOGÍAS DE ALMACENAMIENTO LOCAL">
      <p>
        Conforme al principio de <strong className="text-foreground">consentimiento informado</strong> de la Ley N.° 8968 y al Capítulo X del Decreto N.° 37899-MEIC, informamos sobre el uso de <em>cookies</em> y almacenamiento local (<em>Local Storage / Session Storage</em>) en <strong className="text-foreground">https://yellowmenstore.app/</strong>:
      </p>

      <Sub title="4.1. ¿Qué son las cookies?">
        <p>
          Son pequeños archivos de texto o registros de almacenamiento local que el navegador guarda en el dispositivo del usuario al visitar la Plataforma para recordar preferencias, mantener la sesión iniciada y conservar los artículos agregados al carrito.
        </p>
      </Sub>

      <Sub title="4.2. Tipos de Cookies Utilizadas">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body border border-border">
            <thead>
              <tr className="bg-secondary/60 text-foreground">
                <th className="text-left p-3 border-b border-border">Categoría</th>
                <th className="text-left p-3 border-b border-border">Finalidad en Yellow Men Store</th>
                <th className="text-left p-3 border-b border-border">Consentimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border align-top">
                <td className="p-3 font-medium text-foreground">Técnicas o Estrictamente Necesarias</td>
                <td className="p-3">Mantener la sesión activa en <strong className="text-foreground">Cuenta</strong>, conservar los productos seleccionados en el <strong className="text-foreground">Carrito</strong>, gestionar la seguridad y procesar el pago.</td>
                <td className="p-3">No requieren consentimiento previo (indispensables para el servicio solicitado).</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-3 font-medium text-foreground">De Preferencias o Personalización</td>
                <td className="p-3">Recordar filtros de búsqueda, estilos visualizados (<em>Techwear, Street Wear, Old Money</em>, etc.) o región de envío.</td>
                <td className="p-3">Requieren consentimiento informado del usuario.</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-3 font-medium text-foreground">Analíticas o de Rendimiento</td>
                <td className="p-3">La analítica de visitantes de esta Plataforma (Lovable) <strong className="text-foreground">no utiliza cookies ni almacena nada en el dispositivo</strong>: mide páginas visitadas, origen de la visita, país, navegador, dispositivo, tiempos de carga y errores de forma anónima.</td>
                <td className="p-3">No utiliza cookies ni identifica al visitante.</td>
              </tr>
              <tr className="align-top">
                <td className="p-3 font-medium text-foreground">Publicitarias o de Marketing</td>
                <td className="p-3">Actualmente la Plataforma <strong className="text-foreground">no utiliza cookies publicitarias</strong> ni píxeles de seguimiento de redes sociales.</td>
                <td className="p-3">No aplica.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub title="4.3. Gestión y Revocación de Cookies">
        <p>
          El usuario puede bloquear o eliminar las cookies en cualquier momento desde la configuración de su navegador (Chrome, Safari, Edge, Firefox), advirtiendo que deshabilitar las cookies técnicas puede impedir el funcionamiento correcto del carrito de compras o el inicio de sesión.
        </p>
      </Sub>
    </Section>
  </div>
);

export default Terms;
