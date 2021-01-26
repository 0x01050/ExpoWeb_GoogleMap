/**
 * Created by womkim on 2017/11/6.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { View, Platform } from 'react-native'
import { WebView } from 'react-native-webview';
import MapView from 'react-native-web-maps';
import { Circle, Marker } from 'react-google-maps';

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

    const location = {lat: 37.9838, lng: 23.7275};
    const circles = [
      { radius: 100, border: '#FFFF00', background: '#FF0000' },
      { radius: 200, border: '#FF0000', background: '#FF0000' },
      { radius: 300, border: '#00FF00', background: '#00FF00' },
      { radius: 500, border: '#E99D31', background: '#E99D31' },
    ]

    return <View style={{width, height}}>
      
      <MapView 
        region={{latitude: location.lat, longitude: location.lng}}
        defaultZoom={15}
      >
        {
          circles.map((circle, index) => 
            <Circle
              center={location}
              radius={circle.radius}
              options={{
                fillColor: circle.background,
                strokeColor: circle.border
              }}
              key={index}
            />
          )
        }
        <Marker
          position={{lat: 37.9838, lng: 23.7275}}
        />
      </MapView>
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