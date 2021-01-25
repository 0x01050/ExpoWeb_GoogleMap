/**
 * Created by womkim on 2017/11/6.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { View, Platform } from 'react-native'
import { WebView } from 'react-native-webview';
import MapView from 'react-native-web-maps';

const renderChart = ({ height, option, accessToken }) => `
  mapboxgl.accessToken = '${accessToken}';
  var map = new mapboxgl.Map(${JSON.stringify(option)});
  `

export default class MapBox extends React.Component<any, any> {
  mapbox: any
  componentWillReceiveProps (nextProps: any) {
    if (JSON.stringify(this.props.option) !== JSON.stringify(nextProps.option) || this.props.height !== nextProps.height || this.props.accessToken !== nextProps.accessToken) {
      const chart = renderChart({ height: nextProps.height, option: nextProps.option, accessToken: nextProps.accessToken})
      console.log(chart)
      this.mapbox.injectJavaScript(chart)
    }
  }

  render () {
    const { height, width, style, source, option, onLoadStart, onLoad, onError, onLoadEnd, onMessage, renderLoading, renderError,accessToken } = this.props
    console.log(height)
    console.log(JSON.stringify(option))
    console.log(accessToken)
    const chart = renderChart({ height, option, accessToken })
    console.log(chart)

    return <View style={{width, height}}>
      
      <MapView 
        region={{latitude: 37.9838, longitude: 23.7275}}
        defaultZoom={15}
      />
      {/* <WebView
        ref={(node: any) => { this.mapbox = node }}
        style={[style, {height, width, backgroundColor: 'transparent'}]}
        injectedJavaScript={renderChart({ height, option, accessToken })}
        source={source ? source : Platform.OS === 'android' && !__DEV__ ? { uri:'file:///android_asset/mapbox.html' } : require('./mapbox.html')}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        startInLoadingState={false}
        decelerationRate="normal"
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onError={onError}
        onLoadEnd={onLoadEnd}
        onMessage={onMessage}
        renderLoading={renderLoading}
        renderError={renderError}
        scrollEnabled={false}
      /> */}
    </View>
  }
}

MapBox.propTypes = {
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  height: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  style: PropTypes.object,
  source: PropTypes.object,
  option: PropTypes.object.isRequired,
  accessToken: PropTypes.string,  
  onLoadStart: PropTypes.func,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  onLoadEnd: PropTypes.func,
  onMessage: PropTypes.func,
  renderLoading: PropTypes.func,
  renderError: PropTypes.func
}

MapBox.defaultProps = {
  width: 300,
  height: 300,
  accessToken: '',
}