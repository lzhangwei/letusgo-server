var express = require('express');
var router = express.Router();
var redis = require("redis");
var client = redis.createClient();
var _ = require('lodash');

function loadCategories() {
  var categories = [
    {id: 1, name: '饮料'},
    {id: 2, name: '水果'},
    {id: 3, name: '生活用品'},
    {id: 4, name: '食品'}
  ];
  return categories;
}

function findObjectInString(string, id) {
  var objects = JSON.parse(string);
  return _.find(objects, {id: id});
}

function findIndexInString(string, id) {
  var objects = JSON.parse(string);
  return _.findIndex(objects, {id: id});
}

function getCategoryById(id, callback) {
  client.get('categories', function (err, obj) {
    var category = findObjectInString(obj, parseInt(id));
    callback(category);
  });
}

function addCategory(category, callback) {
  client.get('categories', function (err, obj) {
    obj = JSON.parse(obj);
    category.id = obj[obj.length - 1].id + 1;
    obj[obj.length] = category;
    callback(obj);
  });
}

function putCategory(id, catagory, callback) {
  client.get('categories', function (err, obj) {
    var index = findIndexInString(obj, parseInt(id));
    var objects = JSON.parse(obj);
    objects[index] = catagory;
    callback(objects);
  });
}

function removeCategory(id, callback) {
  client.get('categories', function (err, obj) {
    var index = findIndexInString(obj, parseInt(id));
    var objects = JSON.parse(obj);
    objects.splice(index, 1);
    callback(objects);
  });
}

var categories = loadCategories();
client.set('categories', JSON.stringify(categories));

router.get('/', function (req, res) {
  client.get('categories', function (err, obj) {
    res.send(obj);
  });
});

router.get('/:id', function (req, res) {
  var id = req.params.id;
  getCategoryById(id, function (data) {
    console.log('test:' + data);
    res.send(data);
  });
});

router.post('/', function (req, res) {
  var category = req.param('category');
  addCategory(category, function (data) {
    client.set('categories', JSON.stringify(data), function (err, obj) {
      res.send(data);
    });
  });
});

router.put('/:id', function (req, res) {
  var category = req.param('category');
  var id = req.params.id;
  putCategory(id, category, function (data) {
    client.set('categories', JSON.stringify(data), function (err, obj) {
      res.send(data);
    });
  });
});

router.delete('/:id', function (req, res) {
  var id = req.params.id;
  removeCategory(id, function (data) {
    client.set('categories', JSON.stringify(data), function (err, obj) {
      res.send(data);
    });
  });
});

module.exports = router;
