import gulp from 'gulp'
import zip from 'gulp-zip'
import packageDetails from '../package.json' with { type: 'json' }
import args from './lib/args.js'

function getPackFileType () {
  switch (args.vendor) {
    case 'firefox':
      return '.xpi'
    case 'opera':
      return '.crx'
    default:
      return '.zip'
  }
}

gulp.task('pack', gulp.series('build', () => {
  let name = packageDetails.name
  let version = packageDetails.version
  let filetype = getPackFileType()
  let filename = `${name}-${version}-${args.vendor}${filetype}`
  return gulp.src(`dist/${args.vendor}/**/*`)
    .pipe(zip(filename))
    .pipe(gulp.dest('./packages'))
    .on('end', () => {
      console.log(`Packed dist/${args.vendor} to ./packages/${filename}`)
    })
}))
