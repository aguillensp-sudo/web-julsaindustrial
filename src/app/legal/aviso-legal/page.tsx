import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Aviso legal de Julsa Industrial S.A.",
};

export default function Page() {
  return (
    <LegalPage title="Aviso legal" lastUpdated="10/08/2026">
      <h2 className="text-lg font-bold mb-2">1. Datos identificativos</h2>
      <p className="mb-3">
        En cumplimiento del deber de información recogido en el artículo 10
        de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE), se informa de los
        siguientes datos:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>
          <strong>Denominación social:</strong> Julsa Industrial S.A.
        </li>
        <li>
          <strong>NIF/CIF:</strong> A85580223
        </li>
        <li>
          <strong>Domicilio social:</strong> Calle Núñez de Balboa, 118, 1º I,
          28006 Madrid, España
        </li>
        <li>
          <strong>Teléfono de contacto:</strong> +34 673 76 4987
        </li>
        <li>
          <strong>Correo electrónico de contacto:</strong>{" "}
          administracion@julsaindustrial.com
        </li>
        <li>
          <strong>Datos de inscripción registral:</strong> Registro
          Mercantil, tomo 26.189, folio 190, sección 8, hoja M-471983,
          inscripción 1
        </li>
      </ul>

      <h2 className="text-lg font-bold mb-2">2. Objeto</h2>
      <p className="mb-3">
        El presente sitio web (en adelante, &quot;el sitio web&quot;) tiene
        por objeto informar sobre la actividad de Julsa Industrial S.A.
        —importación y distribución de combustibles, materias primas,
        equipamiento energético y autopartes— y ofrecer a sus clientes
        profesionales un portal privado de pedidos (&quot;el Portal&quot;)
        bajo registro y autenticación.
      </p>
      <p className="mb-4">
        El acceso al sitio web público es gratuito y no requiere registro
        previo. El acceso al Portal requiere la creación de una cuenta de
        usuario y está reservado a clientes profesionales (uso B2B).
      </p>

      <h2 className="text-lg font-bold mb-2">3. Condiciones de uso</h2>
      <p className="mb-3">
        El usuario se compromete a hacer un uso adecuado y lícito del sitio
        web, de conformidad con la legislación aplicable, la buena fe, el
        orden público y el presente Aviso Legal. Queda prohibido:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>Utilizar el sitio web con fines fraudulentos o ilícitos.</li>
        <li>
          Introducir o difundir contenidos o propaganda de carácter
          racista, xenófobo, pornográfico, de apología del terrorismo o que
          atente contra los derechos humanos.
        </li>
        <li>
          Provocar daños en los sistemas del titular, de sus proveedores o
          de terceros.
        </li>
        <li>
          Introducir o difundir virus informáticos o cualquier otro sistema
          susceptible de provocar daños.
        </li>
        <li>
          Intentar acceder a cuentas de otros usuarios o a áreas
          restringidas del Portal sin autorización.
        </li>
      </ul>

      <h2 className="text-lg font-bold mb-2">4. Acceso al Portal de clientes</h2>
      <p className="mb-3">
        El registro en el Portal requiere aportar datos de la empresa (razón
        social, persona de contacto, teléfono, ubicación), un correo
        electrónico y una contraseña. El usuario es responsable de:
      </p>
      <ul className="list-disc pl-5 mb-3 space-y-1">
        <li>La veracidad de los datos aportados en el registro.</li>
        <li>La confidencialidad de sus credenciales de acceso.</li>
        <li>El uso que se haga del Portal desde su cuenta.</li>
      </ul>
      <p className="mb-4">
        Julsa Industrial S.A. se reserva el derecho a suspender o cancelar
        cuentas que incumplan estas condiciones, que aporten datos falsos, o
        por motivos de seguridad.
      </p>

      <h2 className="text-lg font-bold mb-2">
        5. Pedidos y comprobantes de pago
      </h2>
      <p className="mb-4">
        A través del Portal, el cliente registrado puede consultar el
        catálogo con precios, realizar pedidos y subir el comprobante de
        pago correspondiente.
      </p>

      <h2 className="text-lg font-bold mb-2">
        6. Propiedad intelectual e industrial
      </h2>
      <p className="mb-4">
        Todos los contenidos del sitio web (textos, imágenes, logotipos,
        diseño, código fuente, etc.) son titularidad de Julsa Industrial
        S.A. o de terceros que han autorizado su uso, y están protegidos por
        la normativa de propiedad intelectual e industrial. Queda prohibida
        su reproducción, distribución, comunicación pública o transformación
        sin autorización expresa, salvo en los casos permitidos por la ley.
      </p>

      <h2 className="text-lg font-bold mb-2">
        7. Exclusión de responsabilidad
      </h2>
      <p className="mb-3">Julsa Industrial S.A. no se hace responsable de:</p>
      <ul className="list-disc pl-5 mb-3 space-y-1">
        <li>
          Los daños derivados de la falta de disponibilidad o continuidad
          del sitio web.
        </li>
        <li>
          Los contenidos y servicios de terceros a los que se pueda acceder
          mediante enlaces desde el sitio web.
        </li>
        <li>
          El uso indebido que los usuarios puedan hacer de los contenidos o
          del Portal.
        </li>
      </ul>
      <p className="mb-4">
        Julsa Industrial S.A. hará sus mejores esfuerzos para mantener el
        sitio web operativo, pero no garantiza la ausencia de
        interrupciones por causas técnicas ajenas a su control.
      </p>

      <h2 className="text-lg font-bold mb-2">
        8. Legislación aplicable y jurisdicción
      </h2>
      <p className="mb-4">
        El presente Aviso Legal se rige por la legislación española. Para
        la resolución de cualquier controversia derivada del acceso o uso
        del sitio web, las partes se someten a los juzgados y tribunales de
        Madrid (España), salvo que la normativa de protección al
        consumidor aplicable disponga otro fuero de carácter imperativo.
      </p>

      <h2 className="text-lg font-bold mb-2">9. Modificaciones</h2>
      <p>
        Julsa Industrial S.A. se reserva el derecho a modificar el presente
        Aviso Legal para adaptarlo a novedades legislativas o cambios en su
        actividad. Se recomienda a los usuarios revisar este documento
        periódicamente.
      </p>
    </LegalPage>
  );
}
