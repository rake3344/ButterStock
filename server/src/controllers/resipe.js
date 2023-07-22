const conn = require("../db/db");
const { v4: uuidv4 } = require("uuid");

const createResipe = async (req, res) => {
  try {
    const {nombre, descripcion, cantidad_per_plato, activo} = req.body;

    conn.query("INSERT INTO tbl_recetas (id_receta, nombre_receta, descripcion, cantidad_plato, activo,id_restaurant) VALUES(?,?,?,?,?,?)",["sadsas", nombre, descripcion, cantidad_per_plato, activo, "0403a02e-d594-42e1-b621-efe4dd103526"],
    (err, result) => {
      console.log(result)
    }
    );
    console.log(req.body)
    res.status(200).json({"message":"mamolan"})
    
  } catch (error) {
    console.log(error)
  }
 
};

const getAllResipePerUser =  (req, res) => {
  try {
    let {data} = req.body;
    let id = data.id;
    conn.query("SELECT * FROM tbl_recetas  WHERE id_restaurant = ?", [id], (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      }

      if (result.length > 0 || result.length == 0) {
        res.status(200).json({ result });
      }
    });
    
  } catch (error) {
      res.status(500).json({message: error});
  }
}; 

module.exports = {
  createResipe,
  getAllResipePerUser
};
