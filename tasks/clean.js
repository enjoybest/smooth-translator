import gulp from 'gulp'
import { deleteAsync } from 'del'
import args from './lib/args.js'

gulp.task('clean', () => {
  return deleteAsync(`dist/${args.vendor}/**/*`)
})
