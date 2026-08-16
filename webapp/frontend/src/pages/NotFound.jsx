import { Link } from "react-router-dom";
import { useT } from "../i18n.jsx";

export default function NotFound() {
  const [, , t] = useT();
  return (
    <section className="phead nf">
      <div className="wrap narrow">
        <p className="eyebrow mono">404</p>
        <h1>{t("err.h")}</h1>
        <p className="lede">{t("err.b")}</p>
        <Link className="btn cta" to="/">
          {t("err.cta")}
        </Link>
      </div>
    </section>
  );
}
