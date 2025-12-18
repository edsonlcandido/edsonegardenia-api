/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_217614500")

  // remove field
  collection.fields.removeById("text606209421")

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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_217614500")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text606209421",
    "max": 0,
    "min": 0,
    "name": "modo_pagbank",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select606209421")

  return app.save(collection)
})
