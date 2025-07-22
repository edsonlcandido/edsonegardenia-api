/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_12761900")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "file3940301797",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "foto",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [
      "120x120",
      "320x320"
    ],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_12761900")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "file3940301797",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "foto",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
