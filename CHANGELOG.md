# Changelog

## [3.0.0](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v2.0.0...compas-pb-ts-v3.0.0) (2026-08-19)


### ⚠ BREAKING CHANGES

* wrapper constructors take field values rather than `{ data }` or `{ bytes }`; use `X.fromBytes` or `bytesToX` for bytes. `bytesToXData` and `xDataToBytes` are renamed and now take and return wrappers.
* generated types are protobuf-es. `X.encode(v).finish()` and `X.decode(b)` become `toBinary(XSchema, v)` and `fromBinary(XSchema, b)`, message literals must be built with `create(XSchema, {...})`, and AnyData oneofs use `{ data: { case, value } }`. google.protobuf types now come from @bufbuild/protobuf/wkt instead of being generated.

### Features

* add a type registry and the recursive serializer ([d995217](https://github.com/gramaziokohler/compas_pb_ts/commit/d995217a703995087e7646a489a6739be68f9456))
* consume generated bindings and move to protobuf-es ([064e8ed](https://github.com/gramaziokohler/compas_pb_ts/commit/064e8edcf1f62fdeca310fd02bb79594ea1fed4c))
* forward an already-encoded AnyData unchanged ([5231e47](https://github.com/gramaziokohler/compas_pb_ts/commit/5231e47826123588516cd6558cea688ccd9585f9))
* hide the generated types behind the wrappers ([2a76524](https://github.com/gramaziokohler/compas_pb_ts/commit/2a76524e868112e70f1eee75e89f20908992b406))
* let registered types supply their own codec functions ([a196bae](https://github.com/gramaziokohler/compas_pb_ts/commit/a196bae527ecd07612d3323bbe5b0fdd3fb9f48a))
* ship the bindings fetcher as a reusable bin ([88eea7b](https://github.com/gramaziokohler/compas_pb_ts/commit/88eea7b786889b6dd4a6aeee834a304cbeeaa480))
* ship the generated protobuf modules as subpath exports ([a115109](https://github.com/gramaziokohler/compas_pb_ts/commit/a1151093757ff426a9be6483c8e53af8d17df4a8))


### Bug Fixes

* unpack the bindings archive in Node ([dd51ab5](https://github.com/gramaziokohler/compas_pb_ts/commit/dd51ab52030ed08d1493fde8d6c10f955cbd718e))

## [2.0.0](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.4.1...compas-pb-ts-v2.0.0) (2026-08-06)


### ⚠ BREAKING CHANGES

* support compas_pb 1.0 wire format

### Features

* support compas_pb 1.0 wire format ([17ce274](https://github.com/gramaziokohler/compas_pb_ts/commit/17ce274e472d747ca8bf068682973e2d8950ef43))
* Upgrade compas_pb to 1.0 and add pbDumpBytes/pbLoadBytes ([b36cbc7](https://github.com/gramaziokohler/compas_pb_ts/commit/b36cbc791c8b6d64b487959712d935ff0634016d))

## [1.4.1](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.4.0...compas-pb-ts-v1.4.1) (2026-07-24)


### Bug Fixes

* recursively resolve nested AnyData in Dictionary and List ([26edafb](https://github.com/gramaziokohler/compas_pb_ts/commit/26edafbe6fe4c537d8a20cb0c56fef965c05c8a6))

## [1.4.0](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.3.1...compas-pb-ts-v1.4.0) (2026-07-24)


### Features

* add List message wrapper mirroring Dictionary ([7fc896d](https://github.com/gramaziokohler/compas_pb_ts/commit/7fc896dfcd516298358e7f78d4ab79406be5001e))

## [1.3.1](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.3.0...compas-pb-ts-v1.3.1) (2026-07-02)


### Bug Fixes

* add debugging note about preserved class names ([39ba15b](https://github.com/gramaziokohler/compas_pb_ts/commit/39ba15bee35ea3ee573548ac220d8f020768f99b))

## [1.3.0](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.2.1...compas-pb-ts-v1.3.0) (2026-07-02)


### Features

* expose top-level public API ([2f635c0](https://github.com/gramaziokohler/compas_pb_ts/commit/2f635c0fd2b1a4399c69f108f1aa8f2f5646d249))


### Bug Fixes

* adjust size limit for unminified build ([3fe2386](https://github.com/gramaziokohler/compas_pb_ts/commit/3fe2386ac9d13716c02fced102a904f63cb777cf))
* **ci:** upgrade npm to 11.5.1+ for trusted publishing ([61d26c2](https://github.com/gramaziokohler/compas_pb_ts/commit/61d26c2dbe7ec8a95c8861e93229b446c7168711))
* correct lockfile YAML indentation ([b93f554](https://github.com/gramaziokohler/compas_pb_ts/commit/b93f55462e50e3a50f48c3b50540613baa94cc77))
* **geometry:** add explicit return types for JSR slow-types checker ([cc7738d](https://github.com/gramaziokohler/compas_pb_ts/commit/cc7738d946fa2d4d731cb46961cb025fc8563471))
* **geometry:** fix mesh return values for all geometry types ([3c0a743](https://github.com/gramaziokohler/compas_pb_ts/commit/3c0a743f437e3ae092e0c4f470bce67c1a683a31))
* **lint:** ignore .claude/ in biome ([78f3b68](https://github.com/gramaziokohler/compas_pb_ts/commit/78f3b68accaff4f68a38cc72dd2efd3b86d8b2a1))
* satisfy JSR slow-types checker ([e9f7956](https://github.com/gramaziokohler/compas_pb_ts/commit/e9f79569197d47775e6d9e7bd03088e6ca705b33))

## [1.2.1](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.2.0...compas-pb-ts-v1.2.1) (2026-07-02)


### Bug Fixes

* correct lockfile YAML indentation ([b93f554](https://github.com/gramaziokohler/compas_pb_ts/commit/b93f55462e50e3a50f48c3b50540613baa94cc77))

## [1.2.0](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.1.5...compas-pb-ts-v1.2.0) (2026-07-02)

### ⚠️ BREAKING CHANGES

* **geometry:** remove buildGeometry methods and Three.js dependency
* Remove Three.js dependency throughout the library

### Features

* Refactored analyzer to simplify message processing ([9c276c2](https://github.com/gramaziokohler/compas_pb_ts/commit/9c276c26625d492fb8519d7d015578851d1a34e5))

### Chores

* remove build geometry methods from all geometry classes ([35f6046](https://github.com/gramaziokohler/compas_pb_ts/commit/35f6046157161f3537549804a94283ec4e108044))
* remove unused three.js type dependency ([baaa83f](https://github.com/gramaziokohler/compas_pb_ts/commit/baaa83fd10f29a2319daf08bd0e2e10c47b2beab))

## [1.1.5](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.1.4...compas-pb-ts-v1.1.5) (2026-05-28)


### Bug Fixes

* **geometry:** add explicit return types for JSR slow-types checker ([cc7738d](https://github.com/gramaziokohler/compas_pb_ts/commit/cc7738d946fa2d4d731cb46961cb025fc8563471))

## [1.1.4](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.1.3...compas-pb-ts-v1.1.4) (2026-05-28)


### Bug Fixes

* **geometry:** fix mesh return values for all geometry types ([3c0a743](https://github.com/gramaziokohler/compas_pb_ts/commit/3c0a743f437e3ae092e0c4f470bce67c1a683a31))

## [1.1.3](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.1.2...compas-pb-ts-v1.1.3) (2026-05-26)


### Bug Fixes

* satisfy JSR slow-types checker ([e9f7956](https://github.com/gramaziokohler/compas_pb_ts/commit/e9f79569197d47775e6d9e7bd03088e6ca705b33))

## [1.1.2](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.1.1...compas-pb-ts-v1.1.2) (2026-05-26)


### Bug Fixes

* **ci:** upgrade npm to 11.5.1+ for trusted publishing ([61d26c2](https://github.com/gramaziokohler/compas_pb_ts/commit/61d26c2dbe7ec8a95c8861e93229b446c7168711))

## [1.1.1](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.1.0...compas-pb-ts-v1.1.1) (2026-05-26)


### Bug Fixes

* **lint:** ignore .claude/ in biome ([78f3b68](https://github.com/gramaziokohler/compas_pb_ts/commit/78f3b68accaff4f68a38cc72dd2efd3b86d8b2a1))

## [1.1.0](https://github.com/gramaziokohler/compas_pb_ts/compare/compas-pb-ts-v1.0.2...compas-pb-ts-v1.1.0) (2026-05-26)


### Features

* expose top-level public API ([2f635c0](https://github.com/gramaziokohler/compas_pb_ts/commit/2f635c0fd2b1a4399c69f108f1aa8f2f5646d249))

## Changelog
