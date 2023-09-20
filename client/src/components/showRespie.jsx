import React, { useEffect, useState } from "react";
import "../public/css/showRespieStyle.css";
import { getResipes, getIngredient,saveEditRespie, getResipe, editIngredientsResipe, apiInfoResipe } from "../api/resipe";
import { convertion } from "../public/js/unitConversion";
import {fileUpload} from "../app/cloudinary";
import Navbar from "./reuseComponents/navbar";
import {useParams } from "react-router-dom";
import {AiOutlineSearch, AiOutlineCloseCircle, AiOutlineLoading3Quarters} from "react-icons/ai";
import {MdOutlineNoFood, MdNoDrinks, MdDinnerDining} from 'react-icons/md';
import {GiCupcake} from 'react-icons/gi';
import {BiImageAdd} from 'react-icons/bi';
import { BiAddToQueue } from "react-icons/bi";
import { Field, Form, Formik } from "formik";
import Select from 'react-select';
import { toast } from "react-toastify";
import { FileInputButton, FileMosaic } from "@files-ui/react";

let unitArr = ['kg','lb','oz','gr','mg','und'];

function ShowRespie() {
  //localState
  const [stateResipe, setResipes] = useState([]);
  const [ingredient, setIngredient] = useState([]);
  const [isContinue, setContinue] = useState(false);
  const [activeModal, setModal] = useState(null);
  const [ingredientSelect, setInSelect] = useState([]);
  const [tipoPlato, setTipoPlato] = useState({});
  const [dataRespiSel, setRespiSelet] = useState([]);
  const [respiseFormated, setRFormta] = useState([]);
  const [errorselet, setErro] = useState(null);
  const [ingredientInEdit, setEditIngre] = useState([]);
  const [isSubRespie, setIsSubRespie] = useState(false);
  const [valueImage, setImage] = useState(undefined);
  const [isSending, setSending] = useState(false);
  const [infoReceta , setInfoReceta] = useState({});
  const { id } = useParams();
  const dataTipoPlato = [{"label": "Plato", "value": "Plato"},{"label": "Bebida", "value": "Bebida"},{"label": "Postre", "value": "Postre"},{"label": "Otro", "value": "Otro"}];
  let contador = 0;

  //Loacl variables-

  const showToastMessage = () => {
    toast.success("Guardado con exito", {
      position: toast.POSITION.TOP_CENTER,
    });
  };


  const showToastMessageErr = () => {
    toast.error("Ha ocurrido un error", {
      position: toast.POSITION.TOP_CENTER,
    });
  };


  useEffect(() => {
    document.title = "Recetas";
    //consulta de todas las recetas
    let getResipesPerRestaurant = async () => {
      const response = await getResipes(id);
      try {
        if (Array.isArray(response)) {
          if (response.length > 0) {
           let arr = [];
            //formatear las recetas para meterlas en un array y que este datos vaya a un select
            for (var i in response){
              if (response[i].sub_receta == 1){
                response[i].label = response[i].nombre_receta,
                response[i].value = response[i].id_receta,
                arr.push(response[i]);
              }
            }
            setRFormta(arr);
            setResipes(response);
          } else {
            setResipes(response);
          }

          getIngredients();
        }
      } catch (error) {
        console.error(error);
      }
    };

    getResipesPerRestaurant();
  }, []);

  //obtener ingredientes
  let getIngredients = async () => {
    const response = await getIngredient(id);
    try {
      if (Array.isArray(response)) {
        setIngredient(response);
        setContinue(true);
      }
    } catch (error) {
      console.log(error)
    }
  };


//validacion en los campos
  const validateTxt = (values) => {
    let error = "";
    if (values.length == 0 ){
      error = "*El campo debe ser llenado";
    }else if (values.length > 100){
      error = "*El campo debe tener minimo 60 caracteres";
    }
    return error;
  }

  const validateTxtarea = (values) => {
    let error = "";
    if (values.length == 0 ){
      error = "*El campo debe ser llenado";
    }else if (values.length > 400){
      error = "*El campo debe tener minimo 400 caracteres";
    }
    return error;
  }


  const editIngredients = (row) => {
    //llenar los valores de la infoReceta
    setInfoReceta({
      "subTotal" : row.sub_total,
      "margen_error" : row.margen_error,
      "sub_total_M_E" : row.sub_total_M_E,
      "margenContribucion" : row.margen_contribucion,
      "subTotal_margen_contribucion" : row.subTotal_margen_contribucion,
      "costo_potencial_venta" : row.costo_potencial_venta,
      "iva" : row.iva,
      "costo_venta" : row.costo_venta
    });


    if (row.ingredientes != undefined){
      let ingredientesEdit = row.ingredientes;
      let arrNew = [];
      ingredient.filter((fill) => {
        let value = fill.value;
        ingredientesEdit.filter((fill1) => {
          if (fill1.id_ingrediente == value){
            arrNew.push({
              label: fill1.nombre_ingrediente, 
              value: fill1.id_ingrediente, 
              unidad_medida: fill1.unidad_medida_r, 
              cantidad_total_ingrediente1: fill1.cantidad_por_receta, 
              id_ingrediente_receta: fill1.id_ingrediente_receta, 
              cantidad_total_ingredeinte_general: fill.cantidad_total_ingrediente,
              unidad_medida_original: fill1.unidad_original,
              cantidad_editable: fill.cantidad_editable_ingrediente,
              costo_total: fill.costo_total,
              costo_unitario: fill.costo_unitario
            });
          }
        })
     });

     setEditIngre(arrNew);
     setInSelect(arrNew);

     return;
    }

    setEditIngre([]);
  }

  const editSubRecetas = (row) => {
    if (row.sub_recetas != undefined){
      for (var i in row.sub_recetas){
        row.sub_recetas[i].label = row.sub_recetas[i].nombre_receta;
        row.sub_recetas[i].value = row.sub_recetas[i].id_receta;
      }
    }

  }


  //Renderizado de la recetas
  const mapResipe = (type) => {

    if (stateResipe.length > 0){
      return stateResipe.map((row, index) => {
        let imagen;
        let isSubReceta = row.sub_receta == 0 ? false : true;
        if (row.imagen){
          imagen = <img className="img-respie" src={`${row.imagen}`}/>;
        }else if (row.tipo_receta === 'Plato'){
          imagen = <MdOutlineNoFood/>;
        }else if (row.tipo_receta === 'Bebida'){
          imagen = <MdNoDrinks/>;
        }else if (row.tipo_receta === 'Postre'){
          imagen = <GiCupcake/>;
        }else{
          imagen = <MdDinnerDining/>;
        }
  
        contador++;
  
        row.index = index;
        if (type == 0){
          //recetas
          if (row.sub_receta == 0){
            return (
             <div className={`box-respie ${contador > 3 ? "" : "" }`} key={row.id_receta} onClick={(e) => {setModal(row); editIngredients(row); editSubRecetas(row), setIsSubRespie(isSubReceta), setRespiSelet(row.sub_recetas); setImagenShow(row); }}>
               <div className="title-box">
                 {row.nombre_receta ? row.nombre_receta : "N/A"}
               </div>
               <div className="img-box">{imagen}</div>
              <div className="btn-box"></div>
             </div>
          );
         }
        }else{
          //sub-recetas
          if (row.sub_receta == 1){
            return (
             <div className={`box-respie ${contador > 3 ? "" : "" }`} key={row.id_receta} onClick={(e) => {setModal(row); editIngredients(row); editSubRecetas(row), setIsSubRespie(isSubReceta), setRespiSelet(row.sub_recetas); setImagenShow(row);}}>
               <div className="title-box">
                 {row.nombre_receta ? row.nombre_receta : "N/A"}
               </div>
               <div className="img-box">{imagen}</div>
              <div className="btn-box"></div>
             </div>
          );
         }
        }
        
      });
    }
  };

  const activeDesactieToggle = () => {
    let element = document.getElementById('switchResipe');
    element.classList.remove('circle-respie-desactivate');
    element.classList.remove('circle-respie-active');
  }

  //validar los ingredientes
  const validateIngredient = (row, index) => {
    let idInput = 'resipe_'+index;
    //valor de las unidades de medida
    let valueSelect = document.getElementById('select-'+index).value;
    //valor de la cantidad del ingrediente
    let valueInput = parseFloat(document.getElementById(idInput).value);
    //unidad de medida original
    let unityOriginal = row.unidad_medida_original == undefined ? row.unidad_medida : row.unidad_medida_original ;
    //stock que tiene hasta el momento el ingrediente
    let quantityBD = row.cantidad_editable  == undefined ? row.cantidad_editable_ingrediente : row.cantidad_editable;
    //valor que tiene el ingrediente seleccionado para esta receta
    let valueInitialBdInput = convertion(valueSelect, row.cantidad_total_ingrediente1 == undefined ? 0 : row.cantidad_total_ingrediente1, unityOriginal) ;
    //conversion de unidades
    let valueConvertion = convertion(valueSelect, valueInput , unityOriginal);
    //operacion para sacar cuanto le queda al ingrediente
    let operation = quantityBD - (valueConvertion - valueInitialBdInput);
    //si el stock se vuelve 0 no hay que dejar que siga a aumentado
    let isZero = false;

    document.getElementById(idInput).classList.remove('input-exhausted');
    document.getElementById(idInput).removeAttribute('max', valueInput);
    if (document.getElementById(idInput + 'exhauste')) document.getElementById( idInput + 'exhauste').remove();

    if (operation <= 0){
      const p = document.createElement('p');
      p.textContent = 'Agotado';
      p.setAttribute('id',idInput +'exhauste')
      document.getElementById(idInput).parentNode.appendChild(p);
      document.getElementById(idInput).classList.add('input-exhausted');

      if (document.getElementById(idInput).getAttribute('max') == undefined){
        document.getElementById(idInput).setAttribute('max', valueInput);
      }

      isZero = true;
    }

    ingredient.filter((rowIn) => {
      if (row.value == rowIn.value){
        if (isZero){
          document.getElementById('total_'+index).textContent = '0';
        }else{
          document.getElementById('total_'+index).textContent = '' + operation;
          document.getElementById(idInput).setAttribute('quantytyToRest', operation);
        }
      }
    });
  }

  const updateFiles = (incommingFiles) => {
    setImage(incommingFiles[0]);
  };

  const removeFile = () => {
    setImage(undefined);
  };

  //funcion onchange del formulario para la informacion de la receta
  const onchangeForm = () => {
    //cuando se crea una nueva receta
    let sumatoria = 0;
    for (let i in ingredientSelect){
      let unidadMedida = ingredientSelect[i].unidad_medida;
      let costoUnitario = ingredientSelect[i].costo_unitario;
      let idIngrediente = ingredientSelect[i].value;
      let inputIngrediente = document.querySelector('input[cod='+idIngrediente+']');

      if (inputIngrediente){
        let index = inputIngrediente.getAttribute('index');
        let selectValue = document.getElementById('select-'+index).value; 
        let valueConvertion = inputIngrediente.value
        if (valueConvertion == '') valueConvertion = 1;

        let costoUnitarioValor = convertion(selectValue, parseFloat(valueConvertion), unidadMedida);
        sumatoria = sumatoria + (costoUnitarioValor *  costoUnitario);     
      }
    }

    //margen de error
    let margenError = 0.05;
    let valueMargenError =  sumatoria + (sumatoria * margenError);

    //margen contribucion
    let margenContribucion = 0.6;
    let valueMargenContribucion = valueMargenError + (valueMargenError * margenContribucion);

    //costo potencial venta
    let costoPotencialVenta = valueMargenError + valueMargenContribucion;

    //costo Venta
    let iva = 0.19
    let costoVenta = costoPotencialVenta + (costoPotencialVenta * iva);

    setInfoReceta({
      "subTotal" : sumatoria.toFixed(2),
      "margen_error" : margenError,
      "sub_total_M_E" :valueMargenError.toFixed(2),
      "margenContribucion" : margenContribucion,
      "subTotal_margen_contribucion" : valueMargenContribucion.toFixed(2),
      "costo_potencial_venta" : costoPotencialVenta.toFixed(2),
      "iva" : iva,
      "costo_venta" :  costoVenta.toFixed(2)
    });
  }


  const setImagenShow = (row) => {
    if ( row.imagen != null){
      setImage({ id: "fileId",
        size: 28 * 1024 * 1024,
        type: "image/jpeg",
        name: `${row.nombre_receta}`,
        imageUrl: `${row.imagen}`})
    }else{
      setImage(0);
    }
  }

//   let error = "";
//   if (values.length == 0 ){
//     error = "*El campo debe ser llenado";
//   }else if (values.length > 100){
//     error = "*El campo debe tener minimo 60 caracteres";
//   }
//   return error;
// }
  const validateMargen = (value) => {
    let error = '';
    if (value.length == 0){
      error = "*El campo debe ser llenado";
    }
    return error
  }
  // Renderizado del html
  return (
    <>
      <Navbar />
      <section className="title-page">
        <h2>Recetas</h2>
      </section>
      <section className="create-respie">
        <button onClick={() => {setModal({}); setInSelect([]); setEditIngre([]); setRespiSelet([]); setImage(undefined)}}>
          Agregar nueva receta <BiAddToQueue />
        </button>
      </section>
      <section className="respie-father">
        {/* Recetas  */}
        <section className="respie">
          <div className="title-respie">
            <h2>Lista de Recetas</h2>
          </div>
          <div className="search-respie">
            <div>
              <input
                type="text"
                className="search"
                placeholder="Buscar Receta"
              />
              <span>
                <AiOutlineSearch />
              </span>
            </div>
          </div>
          {/* Data recetas */}
          <div className="data-respie">
            {mapResipe(0)}
          </div>
        </section>
        {/* Sub-recetas */}
        <section className="sub-respie">
          <section className="sub-respie">
            <div className="sub-title-respie">
              <h2>Lista de Sub-Recetas</h2>
            </div>
            <div className="sub-search-respie">
              <div>
                <input
                  type="text"
                  className="search"
                  placeholder="Buscar Receta"
                />
                <span>
                  <AiOutlineSearch />
                </span>
              </div>
            </div>
            {/* Data recetas */}
            <div className="sub-data-respie">
            { mapResipe(1)}
            </div>
          </section>
        </section>
      </section>
      {/* modal para editar y crear  */}
      {/* ------------------------------ */}
      {
        activeModal ? (
          <section className="modal-respie-create">
            <section className="modal-data-respie">
              <div className="aside-respie-left">
                <div className="img-aside-respie">
                  {valueImage ? (
                    <FileMosaic {...valueImage} onDelete={removeFile} info preview />
                  ) : (
                    <div className="div-image-respie">
                      <FileInputButton id="fileUpload" onChange={updateFiles} accept="image/*" label={<BiImageAdd className="icon-resipe-image"/>} color="#FFEA96"/>
                    </div>
                  )}
                </div>
              </div>
              <div className="aside-respie-rigth">
                <div className="header-body">
                  <div className="close-modal-respie">
                      <button type="button" onClick={() => {setModal(null); setInSelect([]); setImage(undefined);}}>Cerrar modal <AiOutlineCloseCircle/></button>
                  </div>
                  <div className="title-modal-respie">
                    {activeModal.id_receta !== undefined ? (<h2>Editar receta</h2>) : (<h2>Crear receta</h2>)}
                  </div>
                </div>
                <div className="body-respie">
                  {/* Fomrik */}
                  <Formik  
                    initialValues={{
                      cantidad_plato: activeModal.cantidad_plato !== undefined ? activeModal.cantidad_plato : 1,
                      descripcion: activeModal.descripcion !== undefined ? activeModal.descripcion : "",
                      imagen: activeModal.imagen !== undefined ? activeModal.imagen : "",
                      nombre_receta: activeModal.nombre_receta !== undefined ? activeModal.nombre_receta : "",
                      tipo_receta: activeModal.tipo_receta !== undefined ? activeModal.tipo_receta : "",
                      sub_receta : 0,
                      id_receta: activeModal.id_receta !== undefined ? activeModal.id_receta : "",
                      margenError : '5%', 
                      margenContribucion  : '30%'
                    }}

                
                    onSubmit={async (values) => {
                      setSending(true);

                      let imagen = activeModal.imagen != undefined ? activeModal.imagen : '';

                      if (valueImage != undefined){
                        if (valueImage.file != undefined){
                          imagen = await fileUpload(valueImage.file);
                       } 
                      }
                    

                      try{
                        if (JSON.stringify(tipoPlato) ==  '{}'){
                          tipoPlato.value = activeModal.tipo_receta;
                        }

                        let dataTable = [];
                        let ingredientEditColumn = [];

                        document.querySelectorAll(".input-cantidad-resipe").forEach((e) => {
                          let value = e.value;
                          let index = e.getAttribute('index');
                          let id_ingredientSend = e.getAttribute('cod'); 
                          let selectData = document.getElementById("select-"+index).value;
                          let cantidad_ingrediente_a_restar = parseFloat(e.getAttribute('count'));
                          let cantidad_ingrediente_a_restar_general = parseFloat(e.getAttribute('countgeneral'));
                          let cantidad_editable = e.getAttribute('quantytytorest');

                          if (cantidad_editable !== undefined){
                            ingredientEditColumn.push([parseFloat(cantidad_editable), id_ingredientSend]);
                          }

                          if (isNaN(cantidad_ingrediente_a_restar)){
                            cantidad_ingrediente_a_restar = cantidad_ingrediente_a_restar_general;
                          }

                          if (value == ''){
                            value = 0;
                          }else{
                            value = parseFloat(value);
                          }

                          dataTable.push([id_ingredientSend, value, selectData, cantidad_ingrediente_a_restar]);
                        });

                        values.ingredientes = dataTable;
                        values.sub_receta =  !isSubRespie ? dataRespiSel : [];
                        values.tipoPlato = tipoPlato.value;
                        values.id_restaurant = id;
                        values.imagen = imagen;
                        values.isSubreceta = isSubRespie ? 1 : 0;

                        //Guardar o editar la receta
                        let idResipeSend = values.id_receta;
                        const response = await saveEditRespie(values);    

                        if (response){
                          if (values.id_receta.length == 0){
                            //se creo una nueva receta falta consultarla para agregarla al arreglo general
                            const responseLimit = await getResipe(id, response);

                            if (Array.isArray(responseLimit)){
                              idResipeSend = responseLimit[0].id_receta;
                              stateResipe.unshift(responseLimit[0]);
                              setResipes(stateResipe);
                            }
                            //cuando se esta editando va por este lado
                          }else{
                            const responseEdit = await getResipe(id, values.id_receta);

                            if (Array.isArray(responseEdit)){
                              let resultEdit = responseEdit.length > 0 ? responseEdit[0] : {};
                              let id_respie = responseEdit.length > 0 ? responseEdit[0].id_receta : '';
                              let arr_respi = stateResipe;
                              
                              for (var i in arr_respi){
                                if (arr_respi[i].id_receta == id_respie){
                                  arr_respi[i] = resultEdit;
                                }
                              }
                              setResipes(arr_respi);
                            }
                          }

                          //Editar los valores de la receta
                          if (ingredientEditColumn.length > 0){
                            for (let i in ingredientEditColumn){
                              const responseIngredients = await editIngredientsResipe(id, ingredientEditColumn[i]);
                              if (responseIngredients){
                                console.log('create succesfully');
                              }else console.log('error');
                            }
                          }

                          //editar o insertar los datos en infoReceta
                          if (JSON.stringify(infoReceta) !== '{}'){
                              const responeInfoResipe = await apiInfoResipe(infoReceta, idResipeSend);
                          }

                          await getIngredients();
                        
                        }else{
                          //algo fallo y no se deberia fallar
                          showToastMessageErr();
                        } 

                        setTimeout(() => {
                          showToastMessage();
                          setModal(null); 
                          setInSelect([]);
                          activeDesactieToggle();
                          setSending(false);
                        }, 1500);
                        setErro(null);
                      }catch(err){
                        console.log(err)
                      }
                    }}
                  >
                    {({ handleSubmit, touched, isSubmitting, errors }) => (
                      <Form onSubmit={handleSubmit}  className="form-respie">
                        <Field type="hidden" name="id_receta"/>
                        <div className="section-form-colum">  
                          <label>¿Es sub receta?</label>
                          <div className="div-swicth-label">
                            <div className="switch-respie">
                              <div className="rail-respie">
                                <span className={`circle-respie ${isSubRespie ? 'circle-respie-active' : 'circle-respie-desactivate'}`}  id="switchResipe" onClick={(e) => {
                                  e.target.classList.remove('circle-respie-desactivate');
                                  e.target.classList.remove('circle-respie-active');
                                  if (isSubRespie){
                                    setIsSubRespie(false);
                                    e.target.classList.add('circle-respie-desactivate');
                                  }else {
                                    e.target.classList.add('circle-respie-active');
                                    setIsSubRespie(true);
                                  }
                                }}></span>
                              </div>
                            </div>
                            <span>{isSubRespie ? 'SI' : 'NO'}</span>
                          </div>
                        </div>
                        <div className="section-form-respie">
                          <div className="input-rows-respie">
                          <label className="label-form-respie" htmlFor="nombre_receta">Nombre de la {isSubRespie ? 'sub receta' : 'receta'}</label>
                            <Field type="text" name="nombre_receta" id="nombre_receta" placeholder="Digite el nombre de la receta" validate={validateTxt}/>
                            <div className="error-respi">{errors.nombre_receta && touched.nombre_receta && ( <p className="error">{errors.nombre_receta}</p>)}</div>                       
                          </div>
                          <div className="input-rows-respie">
                            <label htmlFor="cantidad_plato">Cantidad del plato</label>
                            <Field type="number" name="cantidad_plato" id="cantidad_plato" step="1"  placeholder="Digite la cantidad del plato"/>
                            <div className="error-respi"></div>    
                         </div>
                        </div>
                        <div className="section-form-colum">  
                          <label htmlFor="descripcion">Descripcion de la {isSubRespie ? 'sub receta' : 'receta'}</label>
                          <Field component="textarea" rows="2" validate={validateTxtarea} placeholder="Descripcion de la receta" className="textarea-respie" type="textarea" id="descripcion" name="descripcion"/>
                          <div className="error-respi">{errors.descripcion && touched.descripcion && ( <p className="error">{errors.descripcion}</p>)}</div>    
                        </div>
                        <div className="section-form-respie">
                          <div className="input-rows-respie">
                          <label className="label-form-respie" htmlFor="margen_error">Margen de error</label>
                            <Field type="text" name="margenError" id="margen_error" placeholder="Digite el margen de error" validate={validateMargen}/>
                            <div className="error-respi">{errors.margenError && touched.margenError && ( <p className="error">{errors.margenError}</p>)}</div>                 
                          </div>
                          <div className="input-rows-respie">
                            <label htmlFor="margenContribucion">Margen de contribucion</label>
                            <Field type="text" name="margenContribucion" id="margenContribucion" placeholder="Digite el margen de contribucion" validate={validateMargen}/>
                            <div className="error-respi">{errors.margenContribucion && touched.margenContribucion && ( <p className="error">{errors.margenContribucion}</p>)}</div>    
                         </div>
                        </div>
                        {/* Select multiple */}
                        <div className="section-form-colum">  
                          <label htmlFor="ingredient">Ingredientes</label>
                          {/* Select multiple libreria react select */}
                            <Select onChange={(e) => {setInSelect(e); onchangeForm()}}
                              closeMenuOnSelect={false}
                              defaultValue={ingredientInEdit.length > 0 ? ingredientInEdit : null}
                              options={ingredient}
                              placeholder="Seleccione los ingredientes para crear la receta"
                              isMulti
                          />

                           <div className="error-respi"></div>   
                            {
                              ingredientSelect.length > 0 ?
                              (
                                <table className="table-ingredient-respie">
                                  <thead>
                                    <tr>
                                      <th>Nombre</th>
                                      <th>Cantidad por ingrediente</th>
                                      <th>Unidad de medida</th>
                                      <th>Cantidad disponible</th>
                                      <th>Unidad de medida original</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                      {ingredientSelect.map((row, index) => {
                                        return (
                                          <tr key={row.label}>
                                            <td> {row.label} </td>
                                            <td> 
                                              <input className="input-cantidad-resipe" step="1" min="0" index={index} id={`resipe_${index}`} cod={`${row.value}`} count={`${row.cantidad_total_ingrediente}`} 
                                              countgeneral={`${row.cantidad_total_ingredeinte_general}`} type="number" placeholder="cantidad ingrediente" defaultValue={row.cantidad_total_ingrediente1 ? row.cantidad_total_ingrediente1 : 0} onChange={() => {validateIngredient(row, index); onchangeForm()}} />  
                                            </td>
                                            <td> 
                                              <span className="span-table-respie">
                                                Inicial : {row.unidad_medida} 
                                              </span>
                                              <select className="select-respie-gra"  id={`select-${index}`} defaultValue={row.unidad_medida != undefined ? row.unidad_medida : ""} onChange={() => {validateIngredient(row, index); onchangeForm()}}>
                                              {!row.unidad_medida != undefined  && !row.unidad_medida.includes(unitArr) ? (
                                                  <>
                                                  <option value="und">und</option>
                                                  <option value="gr">gr</option>
                                                  <option value="lb">lb</option>
                                                  <option value="kg">kg</option>
                                                  <option value="oz">oz</option>
                                                  </>
                                              ) : (
                                                <>
                                                <option value="lt">lt</option>
                                                <option value="cm3">cm3</option>
                                                <option value="ml">ml</option>
                                                </>
                                              )}                                                
                                              </select>
                                             </td>
                                             <td id={`total_${index}`}>{row.cantidad_editable == undefined ? row.cantidad_editable_ingrediente :row.cantidad_editable }</td>
                                             <td>{row.unidad_medida_original == undefined ? row.unidad_medida : row.unidad_medida_original}</td>
                                          </tr>
                                        )
                                      })}
                                  </tbody>
                                </table>
                              ) 
                              : (null)                            
                            }
                        </div>
                        {!isSubRespie ? (
                        <div className="section-form-colum">  
                          <label htmlFor="Sub-receta">Sub-recetas</label>
                          {/* Select para las sub-recetas */}
                          <Select id="Sub-receta" onChange={(e) => {setRespiSelet(e); onchangeForm()}}
                              closeMenuOnSelect={false}
                              defaultValue={activeModal.sub_recetas}
                              isMulti                
                              options={respiseFormated}
                              placeholder="Seleccione las recetas que necesitan de esta receta para hacerse"
                          />
                           <div className="error-respi"></div>   
                           {/* Crear la tabla para las sub-recetas solo visual */}
                           {
                            dataRespiSel.length > 0 ? 
                            (
                              <table className="table-ingredient-respie">
                                <thead>
                                  <tr>
                                    <th>imagen</th>
                                    <th>Nombre</th>
                                    <th>Tipo receta</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    dataRespiSel.map((row) => {
                                      return (
                                        <tr key={row.label}>
                                          <td>{row.imagen == null ? 'no tiene' : <img className="img-table-subRespie" src={row.imagen} /> }</td>
                                          <td>{row.nombre_receta}</td>
                                          <td>{row.tipo_receta}</td>
                                        </tr>
                                      )
                                    })
                                  }
                                </tbody>
                              </table> 
                              ) : (null)
                            }
                        </div>
                        ) : (null)}
                         <div className="section-form-colum">  
                          <label htmlFor="tipo_plato">Tipo de Receta</label>
                          {/* Select normal para tipo de plato */}
                          <Select id="tipo_plato" onChange={(e) => {setTipoPlato(e); onchangeForm()}}
                              closeMenuOnSelect={true}  
                              defaultValue={activeModal.tipo_receta ? [{"label": activeModal.tipo_receta, "value": activeModal.tipo_receta}] : ""}              
                              options={dataTipoPlato}
                              placeholder="Seleccione el tipo de plato"
                          />
                           <div className="error-respi">{errorselet ? (<p className="error">{errorselet}</p>)  : null}</div>   
                        </div>
                        <div className="section-form-colum-btn">  
                            <button type="submit" disabled={isSubmitting}>{isSubmitting ? (
                              <AiOutlineLoading3Quarters className="load-respie-send"/>
                           ) : (
                            "Enviar"
                      )}</button>                    
                        </div>
                      </Form>
                   )}
                  </Formik>
                </div>
              </div>

              {/* tabla de la informacion general de la receta */}
              <div className="div-info-resipe">
                <table className="tbl-info-resipe">
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="td-info-resipe">Subtotal</td>
                  </tr>
                  <tr>
                    <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.subTotal}</p>) : ('N/A')}</td>
                  </tr>
                  <tr>
                    <td className="td-info-resipe">Margen de error</td>
                  </tr>
                  <tr>
                    <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.margen_error*100}</p>) : ('N/A')}</td>
                  </tr>
                  <tr>
                    <td className="td-info-resipe">SubTotal + margen de error</td>
                  </tr>
                  <tr>
                    <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.sub_total_M_E}</p>) : ('N/A')}</td>
                  </tr>
                  <tr>
                    <td className="td-info-resipe">Margen contribucion</td>
                  </tr>
                  <tr>
                    <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.margenContribucion*100}</p>) : ('N/A')}</td>
                  </tr>
                  <tr>
                    <td className="td-info-resipe">subTotal margen contribucion</td>
                  </tr>
                  <tr>
                    <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.subTotal_margen_contribucion}</p>) : ('N/A')}</td>
                  </tr>
                  <tr>
                    <td className="td-info-resipe">Costo potencial venta</td>
                  </tr>
                  <tr>
                    <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.costo_potencial_venta}</p>) : ('N/A')}</td>
                  </tr>
                  <tr>
                    <td className="td-info-resipe">Iva</td>
                  </tr>
                  <tr>
                    <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.iva*100}</p>) : ('N/A')}</td>
                  </tr>
                  <tr>
                    <td className="td-info-resipe">Costo venta</td>
                  </tr>
                  <tr>
                   <td className="td-info-data-resipe">{JSON.stringify(infoReceta) != '{}' ? (<p>${infoReceta.costo_venta}</p>) : ('N/A')}</td>
                  </tr>
                </tbody>
                </table>
              </div>
            </section>
          </section>
        ) : null
      }
      {isSending ? (
        <div className="sending-respie">
          <div className="body-info-respie">
            <div className="info-sending-respie">
              <div className="icon-loading-respie">
                <AiOutlineLoading3Quarters className="load-send-respie"/>
              </div>
              <div className="txt-loading-respie">Enviando, por favor espere</div>
            </div>
          </div>
        </div>
        ) : (null)}
    </>
  );
}

export default ShowRespie;
