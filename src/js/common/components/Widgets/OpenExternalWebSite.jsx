import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { cordovaOpenSafariView } from '../../utils/cordovaUtils';
import { isAndroid, isWebApp } from '../../utils/isCordovaOrWebApp';
import { renderLog } from '../../utils/logging';
import stringContains from '../../utils/stringContains';

export default class OpenExternalWebSite extends Component {
  render () {
    renderLog('OpenExternalWebSite');  // Set LOG_RENDER_EVENTS to log all renders
    // console.log('OpenExternalWebSite props ', this.props);
    const { delay, className, linkIdAttribute, url } = this.props;
    const integerDelay = delay && delay >= 0 ? delay : 50;
    const classNameString = className !== undefined ? className : 'open-web-site';
    let externalUrl = url;
    if (!stringContains('http', externalUrl)) {
      externalUrl = `http://${externalUrl}`;
    }
    if (isAndroid()) {
      // Rendered message:
      // "Webpage not available"
      // "The webpage at http://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures could not be loaded because: net::ERR_CLEARTEXT_NOT_PERMITTED"
      // Cordova Android 8 and higher will not open a http link, and if the site doesn't handle SSL, tough luck
      externalUrl = externalUrl.replace('http://', 'https://');
    }

    if (isWebApp()) {
      return (
        <a
          id={linkIdAttribute || ''}
          href={externalUrl}
          className={classNameString}
          target={this.props.target || ''}
          rel="noopener noreferrer"
          title={this.props.title || ''}
          aria-label={this.props.ariaLabel}
        >
          {this.props.body ? this.props.body : ''}
        </a>
      );
    } else {
      return (
        <span
          id={linkIdAttribute || ''}
          className={classNameString}
          title={this.props.title || ''}
          onClick={() => cordovaOpenSafariView(externalUrl, null, integerDelay)}
        >
          {this.props.body || ''}
        </span>
      );
    }
  }
}
OpenExternalWebSite.propTypes = {
  url: PropTypes.string.isRequired,
  className: PropTypes.string,
  linkIdAttribute: PropTypes.string,
  target: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  body: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  delay: PropTypes.number,
};
