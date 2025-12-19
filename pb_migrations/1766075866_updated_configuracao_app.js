/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3289291083")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select3330865663",
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
  const collection = app.findCollectionByNameOrId("pbc_3289291083")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select3330865663",
    "maxSelect": 1,
    "name": "pagbank_modo",
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
})
