/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_217614500")

  // remove field
  collection.fields.removeById("select606209421")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4101391790",
    "max": 0,
    "min": 0,
    "name": "url",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1597481275",
    "max": 0,
    "min": 0,
    "name": "token",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_217614500")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select606209421",
    "maxSelect": 1,
    "name": "modo_pagbank",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "sandbox",
      "producao"
    ]
  }))

  // remove field
  collection.fields.removeById("text4101391790")

  // remove field
  collection.fields.removeById("text1597481275")

  return app.save(collection)
})
