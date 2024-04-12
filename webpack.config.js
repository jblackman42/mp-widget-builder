module.exports = {
  mode: process.env.NODE_ENV ?? 'development',
  entry: '',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react',
                '@babel/preset-typescript'
              ]
            }
        }
      },
      {
        test: /\.css$/, // Add this rule to handle CSS files
        use: [
          'style-loader', // This loader injects CSS into the DOM via a <style> tag
          'css-loader'    // This loader resolves @import and url() as import/require()
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
};