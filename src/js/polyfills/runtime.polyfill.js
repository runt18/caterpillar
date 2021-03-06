// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Polyfill for the Chrome Apps runtime API.
 */

'use strict';

(function() {

// Add namespaces for the polyfill if they don't already exist.
if (!chrome.runtime)
  chrome.runtime = {};

/**
 * Not implemented.
 */
chrome.runtime.Port = class {
  constructor() {
    throw new Error('Port not implemented.');
  }
};

/**
 * Not implemented.
 */
chrome.runtime.MessageSender = class {
  constructor() {
    throw new Error('MessageSender not implemented.');
  }
};

/**
 * The operating system the browser is running on.
 */
chrome.runtime.PlatformOs = {
  ANDROID: 'android',
  CROS: 'cros',
  LINUX: 'linux',
  MAC: 'mac',
  OPENBSD: 'openbsd',
  WIN: 'win'
};

/**
 * The machine's processor architecture.
 */
chrome.runtime.PlatformArch = {
  ARM: 'arm',
  X86_32: 'x86-32',
  X86_64: 'x86-64'
};

/**
 * The native client architecture. This may be different from arch on some
 * platforms.
 */
chrome.runtime.PlatformNaclArch = {
  ARM: 'arm',
  X86_32: 'x86-32',
  X86_64: 'x86-64'
};

/**
 * An object containing information about the current platform.
 */
chrome.runtime.PlatformInfo = class {
  constructor(os, arch, nacl_arch) {
    this.os = os;
    this.arch = arch;
    this.nacl_arch = nacl_arch;
  }
};

/**
 * Result of the update check.
 */
chrome.runtime.RequestUpdateCheckStatus = {
  THROTTLED: "throttled",
  NO_UPDATE: "no_update",
  UPDATE_AVAILABLE: "update_available"
};

/**
 * The reason that this event is being dispatched.
 */
chrome.runtime.OnInstalledReason = {
  INSTALL: "install",
  UPDATE: "update",
  CHROME_UPDATE: "chrome_update",
  SHARED_MODULE_UPDATE: "shared_module_update"
};

/**
 * The reason that this event is being dispatched.
 */
chrome.runtime.OnRestartRequiredReason = {
  APP_UPDATE: "app_update",
  OS_UPDATE: "os_update",
  PERIODIC: "periodic"
};

/**
 * Defined during an API method if there was an error.
 */
chrome.runtime.lastError = null;

/**
 * The ID of the app, or null if not applicable.
 */
chrome.runtime.id = null;

/**
 * Retrieves the JavaScript 'window' object for the background page running
 * inside the current app.
 *
 * Always sets an error in lastError since there is no background page for a
 * progressive web app.
 *
 * @param {function} callback Callback function on success or error.
 */
chrome.runtime.getBackgroundPage = function(callback) {
  caterpillar_.setError('No background page for progressive web apps.');
  callback();
};

/**
 * Opens an extension's options page, if possible.
 *
 * Always sets an error in lastError since this isn't an extension.
 *
 * @param {function=} opt_callback Callback function on success or error.
 */
chrome.runtime.openOptionsPage = function(opt_callback) {
  caterpillar_.setError('Could not create an options page.');
  if (opt_callback)
    opt_callback();
};

/**
 * Returns details about the app or extension from the manifest. The object
 * returned is a serialization of the full manifest file.
 *
 * Note that this returns the *original* Chrome App manifest, not the
 * progressive web app manifest.
 *
 * @returns {object} Copy of the Chrome App manifest.
 */
chrome.runtime.getManifest = function() {
  return JSON.parse(JSON.stringify(caterpillar_.manifest));
};

/**
 * Not implemented.
 */
chrome.runtime.getURL = function() {
  throw new Error('getURL not implemented.');
};

/**
 * Sets the URL to be visited upon uninstallation.
 *
 * Does nothing but call the callback, since there is no uninstallation event
 * for a progressive web app.
 *
 * @param {string} url URL to visit upon uninstallation.
 * @param {function=} opt_callback Callback function on success or error.
 */
chrome.runtime.setUninstallURL = function(url, opt_callback) {
  if (opt_callback)
    opt_callback();
};

/**
 * Reloads the app.
 *
 * In this polyfill, this function just refreshes the page.
 */
chrome.runtime.reload = function() {
  if ('location' in self)
    location.reload();
};

/**
 * Requests an update check for this app.
 *
 * In this polyfill, there will never be an update available.
 *
 * @param {function} callback Callback function taking a
 *     RequestUpdateCheckStatus and a details object.
 */
chrome.runtime.requestUpdateCheck = function(callback) {
  callback(chrome.runtime.RequestUpdateCheckStatus.NO_UPDATE);
};

/**
 * Does nothing.
 */
chrome.runtime.restart = function() {};

/**
 * Not implemented.
 */
chrome.runtime.connect = function() {
  throw new Error('connect not implemented.');
};

/**
 * Not implemented.
 */
chrome.runtime.connectNative = function() {
  throw new Error('connectNative not implemented.');
};

/**
 * Not implemented.
 */
chrome.runtime.sendMessage = function() {
  throw new Error('sendMessage not implemented.');
};

/**
 * Not implemented.
 */
chrome.runtime.sendNativeMessage = function() {
  throw new Error('sendNativeMessage not implemented.');
};

/**
 * Gets information about the current operating system.
 *
 * @param {function} callback Function taking PlatformInfo.
 */
chrome.runtime.getPlatformInfo = function(callback) {
  // Here, we use platform.js to guess a reasonable value for the platform
  // information expected by Chrome Apps. This is pretty hard since we can't
  // make the same guarantees a Chrome App can about the open web, so this is a
  // "best guess".

  // We need to guess: android, cros, linux, mac, openbsd, win
  // We also need to guess: x86-64, x86-32, arm
  var os = platform.os.family.toLowerCase();
  if (os.indexOf('win') !== -1) {
    os = 'win';
  } else if (os.indexOf('android') !== -1) {
    os = 'android';
  } else if (os.indexOf('linux') !== -1) {
    os = 'linux';
  } else if (os.indexOf('mac') !== -1) {
    os = 'mac';
  } else if (os.indexOf('bsd') !== -1) {
    os = 'openbsd';
  }

  var arch = platform.os.architecture;
  if (platform.os.architecture == '64' || platform.os.architecture == '32') {
    arch = 'x86-' + platform.os.architecture;
  }
  var nacl_arch = arch;
  var info = new chrome.runtime.PlatformInfo(os, arch, nacl_arch);
  callback(info);
};

/**
 * Not implemented.
 */
chrome.runtime.getPackageDirectoryEntry = function() {
  throw new Error('getPackageDirectoryEntry not implemented.');
};

/**
 * Not implemented events. All addListener methods for not implemented events
 * have been stubbed in this polyfill.
 */

chrome.runtime.onStartup = {
  addListener: function() {
    throw new Error('onStartup not implemented.');
  }
};

chrome.runtime.onInstalled = {
  addListener: function() {
    throw new Error('onInstalled not implemented.');
  }
};

chrome.runtime.onSuspend = {
  addListener: function() {
    throw new Error('onSuspend not implemented.');
  }
};

chrome.runtime.onSuspendCanceled = {
  addListener: function() {
    throw new Error('onSuspendCanceled not implemented.');
  }
};

chrome.runtime.onUpdateAvailable = {
  addListener: function() {
    throw new Error('onUpdateAvailable not implemented.');
  }
};

chrome.runtime.onBrowserUpdateAvailable = {
  addListener: function() {
    throw new Error('onBrowserUpdateAvailable not implemented.');
  }
};

chrome.runtime.onConnect = {
  addListener: function() {
    throw new Error('onConnect not implemented.');
  }
};

chrome.runtime.onConnectExternal = {
  addListener: function() {
    throw new Error('onConnectExternal not implemented.');
  }
};

chrome.runtime.onMessage = {
  addListener: function() {
    throw new Error('onMessage not implemented.');
  }
};

chrome.runtime.onMessageExternal = {
  addListener: function() {
    throw new Error('onMessageExternal not implemented.');
  }
};

chrome.runtime.onRestartRequired = {
  addListener: function() {
    throw new Error('onRestartRequired not implemented.');
  }
};

}).call(this);
