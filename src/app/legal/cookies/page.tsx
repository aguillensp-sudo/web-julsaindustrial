import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Política de cookies de Julsa Industrial.",
};

export default function Page() {
  return (
    <LegalPage title="Política de cookies" lastUpdated="10/08/2026">
      <h2 className="text-lg font-bold mb-2">1. ¿Qué son las cookies?</h2>
      <p className="mb-4">
        Las cookies son pequeños archivos que un sitio web guarda en tu
        navegador para recordar información entre visitas o durante tu
        sesión: mantener la sesión iniciada, recordar preferencias, o —en
        otros sitios— analizar el uso o mostrar publicidad. Este sitio web
        usa cookies de forma limitada, como se detalla a continuación.
      </p>

      <h2 className="text-lg font-bold mb-2">2. Cookies que utilizamos</h2>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              <th className="py-2 pr-3">Cookie</th>
              <th className="py-2 pr-3">Tipo</th>
              <th className="py-2 pr-3">Finalidad</th>
              <th className="py-2 pr-3">Duración</th>
              <th className="py-2">¿Requiere consentimiento?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 pr-3">
                Cookies de sesión de Supabase Auth (<code>sb-*</code>)
              </td>
              <td className="py-2 pr-3">Técnica / necesaria</td>
              <td className="py-2 pr-3">
                Mantener tu sesión iniciada en el Portal de clientes o en el
                panel de administración; sin ellas no podrías acceder a tu
                cuenta
              </td>
              <td className="py-2 pr-3">
                Mientras la sesión permanece activa
              </td>
              <td className="py-2">
                No — son estrictamente necesarias para prestar el servicio
                que solicitas (art. 22.1 LSSI, excepción de cookies
                técnicas)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-4">
        Actualmente <strong>no utilizamos cookies de analítica,
        personalización ni publicidad</strong>. Si esto cambia,
        actualizaremos esta política y solicitaremos tu consentimiento
        previo mediante un banner de cookies antes de instalar cualquier
        cookie no estrictamente necesaria.
      </p>

      <h2 className="text-lg font-bold mb-2">3. Cookies de terceros</h2>
      <p className="mb-4">
        El sitio no incorpora en este momento herramientas de terceros
        (analítica, mapas embebidos, redes sociales, publicidad) que
        instalen sus propias cookies.
      </p>

      <h2 className="text-lg font-bold mb-2">
        4. Cómo gestionar o eliminar las cookies
      </h2>
      <p className="mb-3">
        Puedes configurar tu navegador para bloquear o eliminar las
        cookies ya instaladas. Ten en cuenta que, si bloqueas las cookies
        técnicas de sesión,{" "}
        <strong>
          no podrás iniciar sesión ni usar el Portal de clientes o el panel
          de administración
        </strong>
        , ya que son imprescindibles para ese servicio.
      </p>
      <p className="mb-2">Instrucciones según navegador:</p>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>
          <strong>Chrome:</strong> Configuración → Privacidad y seguridad →
          Cookies y otros datos de sitios.
        </li>
        <li>
          <strong>Firefox:</strong> Opciones → Privacidad y seguridad →
          Cookies y datos del sitio.
        </li>
        <li>
          <strong>Safari:</strong> Preferencias → Privacidad → Gestionar
          datos de sitios web.
        </li>
        <li>
          <strong>Edge:</strong> Configuración → Cookies y permisos del
          sitio.
        </li>
      </ul>

      <h2 className="text-lg font-bold mb-2">5. Base legal</h2>
      <p className="mb-4">
        Las cookies estrictamente necesarias para prestar el servicio
        solicitado por el usuario (como mantener la sesión iniciada) están
        exentas del deber de solicitar consentimiento según el artículo
        22.1 de la LSSI-CE. Cualquier cookie no estrictamente necesaria que
        se incorpore en el futuro requerirá tu consentimiento previo,
        informado y expreso.
      </p>

      <h2 className="text-lg font-bold mb-2">6. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta Política de Cookies para reflejar cambios
        en las cookies que utilizamos. Te recomendamos revisarla
        periódicamente.
      </p>
    </LegalPage>
  );
}
