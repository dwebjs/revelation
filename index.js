var flockPresets = require('@dwebjs/presets')
var rev = require('@dwebjs/flock')
var xtend = require('xtend')

modules.export = DDriveFlock

function DDriveFlock (vault, opts) {
  if (!(this instanceof DDriveFlock)) return new DDriveFlock(vault, opts)
  if (!opts) opts = {}

  var self = this 
  this.vault = vault
  this.uploading = !(opts.upload === false)
  this.downloading = !(opts.download === false)
  this.live = !(opts.live === false)

  var isDappdbInstance = !!(vault.get && vault.put && vault.replicate && vault.authorize)

  if(isDappdbInstance && !vault.local) {
    throw new Error('dWeb flock must be created after the local dAppDB instance is ready!')
  }

  //dWeb Flock Options
  opts = extend({
    port: 6620,
    id: isDappdbInstance ? vault.local.id.toString('hex') : vault.id,
    hash: false,
    stream: function (peer) {
      return vault.replicate(xtend({
        live: self.live,
        upload: self.uploading,
        download: self.downloading
      }, isDappdbInstance ? {
        userData: vault.local.key
      } : {}))
    }
  }, opts)

  this.flock = rev(flockPresets(opts))
  this.flock.once('error', function () {
    self.flock.listen(0)
  })

  this.flock.listen(opts.port)
  this.flock.join(this.vault.revelationKey)
  return this.flock
}
