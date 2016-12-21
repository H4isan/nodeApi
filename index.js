var express = require("express");
var mongoskin = require("mongoskin");
var bodyParser = require("body-parser");

var app = express();
var db = mongoskin.db("mongodb://@localhost:27017/testdata", {safe: true});
var id = mongoskin.helper.toObjectID;

var allowMethods = function (req, res, next){
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
};

var allowCrossTokenHeader = function (req, res, next){
	res.headers("Access-Control-Allow-Headers", "token");
};

var auth = function(req, res, next) {
	if(req.headers.token === "pass"){
		return next();
	}else {
		return next(new Error("No authorized"));
	}
};
//	http://localhost:8080/api/ :coleccion/ :id
//	http://localhost:8080/api/fami/ :id

app.param("coleccion", function(req, res, next, coleccion){
	req.collection = db.collection(coleccion);
} );

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(allowMethods);
app.use(allowCrossTokenHeader);
// primer post 
app.post("/api/:coleccion", auth, function(req, res, next){
	//req.body.nombre asi cogemos solo nombre del cuerpo q nos envia
	req.collection.insert(req.body, {}, function(e, result){
		if(e) return next (e);
			res.send(result);
	});
});
//GET 
app.get("/api/:coleccion", auth, function(req, res, next){
	req.collection.find({}, {limit: 10, sort: [['_id', -1]]}).toArray(function(e, result){
		if(e) return next(e);
			res.send(result);
	});
});
//obtener uno concreto por su id 
app.get("/api/:coleccion/:id", auth, function(req, res, next){
	req.collection.findOne({_id: id(req.params.id)}, function(e, result){
		if(e) return next(e);
			res.send(result);
	});
});
//PUT para actualizar. 
app.put("/api/:coleccion/:id", auth, function(req, res, next){
	req.collection.update({_id: id(req.params.id)}, {$set: req.body}, {safe: true, multi: false},
		function(e, result){
			if(e) return next(e);
				res.send((result === 1) ? {resultado: "ok"} : {resultado: "error"});
		})
});
//delete
app.delete("/api/:coleccion/:id", auth, function(req, res, next){
	req.collection.remove({_id: id(req.params.id)}, function(e, result){
		if(e) return next(e);
		res.send((result === 1) ? {resultado: "ok"} : {resultado: "error"});
	});
})
//puerto q escuhca el servidor
app.listen(8080, function(){
	console.log("Servidor escuchando en el puerto")
});