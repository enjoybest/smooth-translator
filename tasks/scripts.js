import gulp from 'gulp'
import gulpif from 'gulp-if'
import named from 'vinyl-named'
import webpack from 'webpack'
import gulpWebpack from 'webpack-stream'
import plumber from 'gulp-plumber'
import livereload from 'gulp-livereload'
import args from './lib/args.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { VueLoaderPlugin } from 'vue-loader'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const ENV = args.production ? 'production' : 'development'

gulp.task('scripts', (cb) => {
  return gulp.src('app/scripts/*.js')
    .pipe(plumber({
      // Webpack will log the errors
      errorHandler () {}
    }))
    .pipe(named())
    .pipe(gulpWebpack({
      mode: ENV,
      devtool: args.sourcemaps ? 'inline-source-map' : false,
      watch: args.watch,
      plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
          'process.env.VENDOR': JSON.stringify(args.vendor)
        })
      ],
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              transformToRequire: {
                image: 'xlink:href'
              }
            }
          },
        ]
      },
      resolve: {
        alias: {
          helpers: path.resolve(projectRoot, 'app/scripts/helpers/'),
          mixins: path.resolve(projectRoot, 'app/scripts/mixins/')
        },
        extensions: ['.js', '.json', '.vue']
      }
    },
    webpack,
    (err, stats) => {
      if (err) return
      console.log(`Finished 'scripts'`, stats.toString({
        chunks: false,
        colors: true,
        cached: false,
        children: false
      }))
    }))
    .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
    .pipe(gulpif(args.watch, livereload()))
})
