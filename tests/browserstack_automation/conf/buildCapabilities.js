const axios = require('axios');
const fs = require('fs');
const browserStackConfig = require('./browserstack.conf');

// Visit https://www.browserstack.com/docs/app-automate/api-reference/appium/devices#get-device-list for details

async function fetchMobileDevices () {
  const url = 'https://api-cloud.browserstack.com/app-automate/devices.json';
  try {
    const response = await axios({
      url,
      withCredentials: true,
      auth: {
        username: browserStackConfig.BROWSERSTACK_USER,
        password: browserStackConfig.BROWSERSTACK_KEY,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function buildCapabilities () {
  const browserCapabilities = [
    {
      browserName: 'Chrome',
      'bstack:options': {
        os: 'Windows',
        osVersion: '11',
        browserVersion: 'latest',
      },
    },
    {
      browserName: 'Chrome',
      'bstack:options': {
        os: 'Windows',
        osVersion: '10',
        browserVersion: 'latest',
      },
    },
    {
      browserName: 'Safari',
      'bstack:options': {
        os: 'OS X',
        osVersion: 'Catalina',
        browserVersion: '13.1',
      },
    },
  ];
  const mobileDevices = await fetchMobileDevices();
  const mobileCapabilities = [];
  for (let i = 0; i < mobileDevices.length; i++) {
    const capability = mobileDevices[i];
    if (browserStackConfig.BROWSERSTACK_IPA_URL || browserStackConfig.BROWSERSTACK_APK_URL) {
      if (capability.os === 'ios') {
        capability['appium:app'] = browserStackConfig.BROWSERSTACK_IPA_URL;
      } else {
        capability['appium:app'] = browserStackConfig.BROWSERSTACK_APK_URL;
      }
      capability.platformName = capability.os;
      capability['appium:platformVersion'] = capability.os_version;
      capability['appium:deviceName'] = capability.device;
      capability['bstack:options'] = {};
      // Delete extra keys
      delete capability.os;
      delete capability.os_version;
      delete capability.device;
      delete capability.realMobile;
      mobileCapabilities.push(capability);
    }
  }
  const capabilities = [...browserCapabilities, ...mobileCapabilities];
  try {
    fs.writeFileSync('./tests/browserstack_automation/conf/capabilities.json', JSON.stringify(capabilities, null, 2));
  } catch (error) {
    console.error(error);
  }
}

buildCapabilities();
