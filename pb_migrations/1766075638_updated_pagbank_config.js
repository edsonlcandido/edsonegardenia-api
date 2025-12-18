/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_217614500")

  // update collection data
  unmarshal({
    "name": "configuracao_pagbank"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_217614500")

  // update collection data
  unmarshal({
    "name": "pagbank_config"
  }, collection)

  return app.save(collection)
})
