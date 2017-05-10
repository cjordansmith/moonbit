module.exports = {
  entry: './app/app.jsx',
  output: {
    path: __dirname,
    filename: './public/js/bundle.js'
  },
  resolve: {
    root: __dirname,
    alias: {
      Main: 'app/components/Main.jsx',
      Nav: 'app/components/Nav.jsx',
      Moon: 'app/components/Moon.jsx',
      MoonForm: 'app/components/MoonForm.jsx',
      MoonMessage: 'app/components/MoonMessage.jsx',
      fitbit: 'app/api/fitbit.jsx'
    },
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0']
        },
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/
      }
    ]
  }
};
