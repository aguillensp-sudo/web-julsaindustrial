import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad y tratamiento de datos personales de Julsa Industrial.",
};

export default function Page() {
  return (
    <LegalPage title="Política de privacidad" lastUpdated="10/08/2026">
      <h2 className="text-lg font-bold mb-2">1. Responsable del tratamiento</h2>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>
          <strong>Responsable:</strong> Julsa Industrial S.A.
        </li>
        <li>
          <strong>NIF/CIF:</strong> A85580223
        </li>
        <li>
          <strong>Domicilio:</strong> Calle Núñez de Balboa, 118, 1º I, 28006
          Madrid, España
        </li>
        <li>
          <strong>Correo electrónico de contacto para privacidad:</strong>{" "}
          administracion@julsaindustrial.com
        </li>
        <li>
          <strong>Delegado de Protección de Datos:</strong> Roberto Abello
        </li>
      </ul>

      <h2 className="text-lg font-bold mb-2">2. Datos que recogemos</h2>
      <p className="mb-3">
        Según el uso que hagas del sitio web y el Portal de clientes,
        tratamos las siguientes categorías de datos:
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              <th className="py-2 pr-3">Origen</th>
              <th className="py-2 pr-3">Datos</th>
              <th className="py-2">Finalidad</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-3">Formulario de contacto</td>
              <td className="py-2 pr-3">
                Nombre, teléfono (opcional), email, mensaje
              </td>
              <td className="py-2">Responder a tu consulta</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-3">Registro en el Portal</td>
              <td className="py-2 pr-3">
                Razón social, persona de contacto, email, teléfono,
                ubicación, contraseña
              </td>
              <td className="py-2">
                Crear y gestionar tu cuenta de cliente profesional
              </td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-3">Uso del Portal</td>
              <td className="py-2 pr-3">
                Pedidos realizados, cantidades, importes, notas
              </td>
              <td className="py-2">
                Gestionar tus pedidos y el histórico de compras
              </td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-3">Comprobantes de pago</td>
              <td className="py-2 pr-3">
                Archivo (PDF/JPG/PNG) que subes al confirmar un pedido
              </td>
              <td className="py-2">
                Verificar el pago y habilitar la entrega
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Navegación</td>
              <td className="py-2 pr-3">
                Cookies técnicas de sesión y, cuando esté activa, analítica
                de uso (ver Política de Cookies)
              </td>
              <td className="py-2">
                Mantener tu sesión iniciada y, en su caso, medir el uso del
                Portal
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-4">
        No solicitamos ni almacenamos datos de tarjetas de pago ni datos
        bancarios directamente en nuestros servidores; los pagos con
        tarjeta, cuando estén disponibles, se procesan a través de Stripe.
      </p>

      <h2 className="text-lg font-bold mb-2">3. Base legal del tratamiento</h2>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>
          <strong>Ejecución de un contrato o medidas precontractuales</strong>{" "}
          (art. 6.1.b RGPD): gestión de tu cuenta, pedidos y comunicaciones
          relacionadas con el servicio.
        </li>
        <li>
          <strong>Consentimiento</strong> (art. 6.1.a RGPD): formulario de
          contacto, y cualquier comunicación comercial que solicite tu
          autorización expresa.
        </li>
        <li>
          <strong>Interés legítimo</strong> (art. 6.1.f RGPD): seguridad del
          Portal, prevención de fraude, mejora del servicio.
        </li>
        <li>
          <strong>Obligación legal</strong> (art. 6.1.c RGPD): conservación
          de facturas y documentación contable/mercantil según la normativa
          aplicable.
        </li>
      </ul>

      <h2 className="text-lg font-bold mb-2">4. Conservación de los datos</h2>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>
          Los datos de cuenta y pedidos se conservan mientras la cuenta
          permanezca activa y, tras su baja, durante 6 años para atender
          posibles responsabilidades fiscales y mercantiles.
        </li>
        <li>
          Los mensajes del formulario de contacto se conservan el tiempo
          necesario para atender la consulta y, salvo que exista una
          relación posterior, se eliminan en un plazo de 12 meses.
        </li>
        <li>
          Los comprobantes de pago se conservan mientras sean necesarios
          para la gestión del pedido y las obligaciones contables
          asociadas.
        </li>
      </ul>

      <h2 className="text-lg font-bold mb-2">
        5. Destinatarios y encargados del tratamiento
      </h2>
      <p className="mb-3">
        Tus datos no se ceden a terceros salvo obligación legal. Para
        prestar el servicio, contamos con proveedores que actúan como{" "}
        <strong>encargados del tratamiento</strong> bajo contrato (art. 28
        RGPD), entre ellos:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>
          <strong>Supabase</strong> (infraestructura de base de datos,
          autenticación y almacenamiento de archivos). Los datos se
          almacenan en Europa.
        </li>
        <li>
          <strong>Google Analytics</strong> (estadísticas de uso del
          Portal). Los datos se almacenan en Europa.
        </li>
        <li>
          <strong>Stripe</strong> (gestión de pagos). Los datos se
          almacenan en Europa.
        </li>
      </ul>
      <p className="mb-4">
        En el caso de que alguno de los proveedores anteriores tenga sede
        fuera del Espacio Económico Europeo, se aplican las garantías
        previstas en el Capítulo V del RGPD.
      </p>

      <h2 className="text-lg font-bold mb-2">6. Tus derechos</h2>
      <p className="mb-3">
        Puedes ejercer en cualquier momento los siguientes derechos,
        escribiendo a administracion@julsaindustrial.com y acreditando tu
        identidad:
      </p>
      <ul className="list-disc pl-5 mb-3 space-y-1">
        <li>
          <strong>Acceso:</strong> conocer qué datos tenemos sobre ti.
        </li>
        <li>
          <strong>Rectificación:</strong> corregir datos inexactos.
        </li>
        <li>
          <strong>Supresión:</strong> solicitar la eliminación de tus datos
          cuando ya no sean necesarios.
        </li>
        <li>
          <strong>Oposición:</strong> oponerte a un tratamiento concreto.
        </li>
        <li>
          <strong>Limitación:</strong> solicitar que limitemos el
          tratamiento en determinados supuestos.
        </li>
        <li>
          <strong>Portabilidad:</strong> recibir tus datos en un formato
          estructurado y de uso común.
        </li>
      </ul>
      <p className="mb-4">
        También tienes derecho a presentar una reclamación ante la Agencia
        Española de Protección de Datos (www.aepd.es) si consideras que el
        tratamiento no se ajusta a la normativa.
      </p>

      <h2 className="text-lg font-bold mb-2">7. Seguridad</h2>
      <p className="mb-4">
        Aplicamos medidas técnicas y organizativas razonables para proteger
        tus datos frente a accesos no autorizados, pérdida o alteración:
        autenticación con contraseña, control de acceso por roles (cliente /
        administrador), cifrado en tránsito (HTTPS) y políticas de
        seguridad a nivel de base de datos. Ningún sistema es inexpugnable
        al 100%; ante cualquier incidencia de seguridad relevante,
        actuaremos conforme a la normativa aplicable (incluida, si procede,
        la notificación a la autoridad de control y a los interesados
        afectados).
      </p>

      <h2 className="text-lg font-bold mb-2">8. Menores de edad</h2>
      <p className="mb-4">
        El Portal está dirigido a clientes profesionales (uso B2B). No está
        destinado a menores de edad y no recogemos conscientemente datos de
        menores.
      </p>

      <h2 className="text-lg font-bold mb-2">9. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta Política de Privacidad para adaptarla a
        cambios normativos o del propio servicio. La versión vigente será
        siempre la publicada en el sitio web.
      </p>
    </LegalPage>
  );
}
