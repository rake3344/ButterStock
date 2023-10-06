import React, { useEffect, useState } from "react";
import Navbar from "./reuseComponents/navbar";
import IconAside from "./reuseComponents/iconsAside";
import "../public/css/homepageStyle.css";
import { getRestaurant } from "../api/restaurant";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { removeToken } from "../auth/auth";
import { MdFastfood } from "react-icons/md";
import Plot from "react-plotly.js";
import { AiOutlineSearch, AiOutlineLoading3Quarters } from "react-icons/ai";

// import {useDispatch, useSelector} from 'react-redux'

function HomePage() {
  const showToastMessageNo = () => {
    toast.error("Ha ocurrido un error", {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  document.title = "HomePage";

  const [id_restaurant, setIdRestaurant] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fecthData = async () => {
      const response = await getRestaurant();
      try {
        if (Array.isArray(response)) {
          if (response.length > 0) {
            setIdRestaurant(response[0].id_restaurant);
            setLoading(false);
            return;
          }
        }

        removeToken();
        window.location.href = "/login";
        showToastMessageNo();
      } catch (error) {
        showToastMessageNo();
      }
    };

    fecthData();
  }, []);

  return (
    <>
      <Navbar />
      {isLoading ? (
        <div className="loding-resipe-homepage">
          <AiOutlineLoading3Quarters />
          <p>Cargando</p>
        </div>
      ) : (
        <section className="father-homepage">
          <section className="info-graf">
            <div className="comanda">
              <div className="txt-comanda">
                <h4>Comandas</h4>
              </div>
              <Link to={`/comandas/${id_restaurant}`} className="url-homepage">
                <div className="init-comanda">
                  <div className="init-comanda-txt">Iniciar Comanda</div>
                  <div className="icon-comanda">
                    <MdFastfood />
                  </div>
                </div>
              </Link>
            </div>
            <div className="grafh">
              <Plot
                data={[
                  {
                    x: ["enero", "Febero", "marzo", "Abril", "Mayo"],
                    y: [12, 34, 3, 4, 1],
                    type: "bar",
                    mode: "markers",
                    marker: {
                      color: "#FFEA96",
                      line: {
                        width: 2.5,
                      },
                    },
                  },
                ]}
                layout={{ width: 600, height: 300, title: "Resumen del mes" }}
                useResizeHandler
                className="plotly"
              />
            </div>
          </section>
          <section className="info-hompage">
            <div className="links-link-1">
              <div className="txt-links">
                <h4>Recetas</h4>
              </div>
              <Link
                to={`../respies/all/${id_restaurant}`}
                className="url-homepage"
              >
                <div className="see-link-1">
                  <div className="txt-link1">
                    <h4>Ver recetas</h4>
                    <p>Mira, crea y edita tus recetas</p>
                  </div>
                  <div className="icon-link-1">
                    <AiOutlineSearch />
                  </div>
                </div>
                <div className="info-3"></div>
              </Link>
            </div>
            <div className="links-link-2">
              <div className="txt-links">
                <h4>Ingredientes</h4>
              </div>
              <Link
                to={`/ingredients/all/${id_restaurant}`}
                className="url-homepage"
              >
                <div className="see-link-2">
                  <div className="txt-link2">
                    <h4>Ver Ingredientes</h4>
                    <p>Mira, crea y edita tus Ingredientes</p>
                  </div>
                  <div className="icon-link-2">
                    <AiOutlineSearch />
                  </div>
                </div>
                <div className="info-3"></div>
              </Link>
            </div>
            <div className="links-link-3">
              <div className="txt-links">
                <h4>Inventario</h4>
              </div>
              <Link
                to={`/inventario/${id_restaurant}`}
                className="url-homepage"
              >
                <div className="see-link-3">
                  <div className="txt-link3">
                    <h4>Ver inventario</h4>
                    <p>Mira, crea tus reportes pebs</p>
                  </div>
                  <div className="icon-link-3">
                    <AiOutlineSearch />
                  </div>
                </div>
              </Link>
              <div className="info-3"></div>
            </div>
          </section>
        </section>
      )}
      <IconAside />
    </>
  );
}

export default HomePage;
