'use strict';

var paths = {
    js:   ['server/js/**/*.js', 'public/**/*.js', 'public/libs/*.js','test/**/*.js'],
    html: ['public/index.html', 'public/templates/**/*.html'],
    css:  ['public/css/*.css', 'packages/**/public/**/css/*.css'],
    productionCss:['public/bower_components/bootstrap/dist/css/bootstrap.css','public/css/application.css'],
    productionJsBower: ["public/bower_components/angular/angular.min.js","public/bower_components/bootstrap/dist/js/bootstrap.min.js","public/bower_components/lodash/dist/lodash.min.js",
        "public/bower_components/ng-file-upload/angular-file-upload-shim.min.js", "public/bower_components/ng-file-upload/angular-file-upload.min.js",
        "public/bower_components/angular-resource/angular-resource.min.js","public/bower_components/angular-ui-router/release/angular-ui-router.min.js","public/bower_components/angular-bootstrap/ui-bootstrap.min.js",
        "public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js","public/bower_components/angular-ui-utils/ui-utils.min.js","public/bower_components/angular-ui-map/ui-map.min.js", "public/bower_components/jquery-touchswipe/jquery.touchSwipe.min.js"],
    productionJsF:['public/js/app.js','public/js/services/*.js','public/js/filter/sharedFilter.js','public/js/controllers/*.js'],
    productionJsP:['libs/*.js']
};

module.exports = function(grunt) {

    if (process.env.NODE_ENV !== 'production') {
        require('time-grunt')(grunt);
    }

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['public/build'],
        concat:{
            css:{
                src: paths.productionCss,
                dest: 'public/dist/css/styles.css'
            },
            jsBower:{
                src: paths.productionJsBower,
                dest: 'public/dist/js/jsbower.min.js'
            },
            jsFront:{
                src: paths.productionJsF,
                dest: 'public/dist/js/sitejs.js'
            },
            jsThirdparty:{
                src: paths.productionJsP,
                dest: 'public/dist/js/thirdparty.js'
            }
        },
        cssmin: {
               minify: {
                expand: false,
                src: ['public/dist/css/styles.css'],
                dest: 'public/dist/css/styles.min.css',
                ext: '.min.css'
              }
        },
        uglify: {
            options:{
                mangle: false
            },
            my_target: {
              files: {
                'public/dist/js/sitejs.min.js': ['public/dist/js/sitejs.js','public/dist/js/thirdparty.js']
              }
            }
        },
        watch: {
            js: {
                files: paths.js,
                tasks: ['concat', 'uglify','jshint'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: paths.html,
                options: {
                    livereload: true
                }
            },
            css: {
                files: paths.css,
                tasks: ['concat', 'cssmin','csslint'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: {
                src: paths.js,
                options: {
                    jshintrc: true
                }
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            src: paths.css
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: [],
                    ignore: ['public/**', 'node_modules/**'],
                    ext: 'js,html',
                    nodeArgs: ['--debug'],
                    delayTime: 1,
                    env: {
                        PORT: require('./server/config/config').port
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec',
                require: 'server.js'
            },
            src: ['test/mocha/**/*.js', 'packages/**/test/mocha/**/*.js']
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma/karma.conf.js'
            }
        }
    });

    //Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //Default task(s).
    if (process.env.NODE_ENV === 'production') {
        grunt.registerTask('default', ['clean','cssmin', 'uglify', 'concurrent']);
    } else {
        grunt.registerTask('default', ['concat','cssmin', 'uglify','jshint', 'csslint', 'concurrent']);
    }

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);

    // For Heroku users only.
    // Docs: https://github.com/linnovate/mean/wiki/Deploying-on-Heroku
    grunt.registerTask('heroku:production', ['cssmin', 'uglify']);
};
