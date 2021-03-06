'use strict';
var paths = {
    js:   ['server/js/**/*.js', 'public/**/*.js', 'public/libs/*.js','test/**/*.js'],
    jsIgnore: ['node_modules/**/*.js','public/libs/**/*.js', 'public/bower_components/**/*.js', 'public/dist/**/*.js'],
    html: ['public/index.html', 'public/templates/**/*.html'],
    css:  ['public/css/*.css', 'packages/**/public/**/css/*.css'],
    productionCss:['public/bower_components/bootstrap/dist/css/bootstrap.css', 'public/css/application.css','public/bower_components/ngQuickDate/dist/ng-quick-date-plus-default-theme.css'],
    prodJsFirst:['public/bower_components/angular/angular.min.js','public/bower_components/jquery/dist/jquery.min.js'],
    productionJsFrontEnd:['public/js/app.js','public/js/services/*.js', 'public/js/filters/*.js','public/js/controllers/*.js', 'public/js/directives/*.js'],
    productionJsBower: ["public/bower_components/bootstrap/dist/js/bootstrap.min.js","public/bower_components/lodash/dist/lodash.min.js",
        "public/bower_components/ng-file-upload/angular-file-upload-shim.min.js", "public/bower_components/ng-file-upload/angular-file-upload.min.js",
        "public/bower_components/angular-resource/angular-resource.min.js","public/bower_components/angular-cookies/angular-cookies.min.js",
        "public/bower_components/angular-ui-router/release/angular-ui-router.min.js",
        "public/bower_components/angular-bootstrap/ui-bootstrap.min.js","public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
        "public/bower_components/angular-ui-utils/ui-utils.min.js","public/bower_components/angular-ui-map/ui-map.min.js", 
        "public/bower_components/socket.io-client/socket.io.js",
        "public/bower_components/jquery-ui/jquery-ui.min.js","public/bower_components/angular-dragdrop/src/angular-dragdrop.min.js"],
    productionJsP:['public/libs/*.js']
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
                dest: 'public/dist/css/application.css'
            },
            prodJsFirst:{ 
                src: paths.prodJsFirst,
                dest: 'public/dist/js/angular_jquery.min.js'

            },
            jsBower:{
                src: paths.productionJsBower,
                dest: 'public/dist/js/jsbower.min.js'
            },
            jsApplication:{
                src: paths.productionJsFrontEnd,
                dest: 'public/dist/js/application.js'
            },
            jsThirdparty:{
                src: paths.productionJsP,
                dest: 'public/dist/js/thirdparty.js'
            }
        },
        cssmin: {
               minify: {
                expand: false,
                src: ['public/dist/css/application.css'],
                dest: 'public/dist/css/application.min.css',
                ext: '.min.css'
              }
        },
        uglify: {
            options:{
                mangle: false
            },
            my_target: {
              files: {
                'public/dist/js/application.min.js': ['public/dist/js/jsbower.min.js','public/dist/js/application.js','public/dist/js/thirdparty.js']
              }
            }
        },
        imagemin: {
            png:{
                options:{
                    optimizationLevel:7
                },
                files: [{
                    expand: true,
                    cwd:'public/images',              
                    src: ['**/*.png'],   
                    dest: 'public/dist/images',
                    ext: '.png'              
                }]
            },
            jpg:{
                options:{
                    progressive: true
                },
                files: [{
                    expand:true,
                    cwd:'public/images',
                    src: ['**/*.jpg'],
                    dest:'public/dist/images',
                    ext: '.jpg'
                }]
            }
        },
        watch: {
            js: {
                files: paths.js,
                // tasks: ['concat', 'uglify','jshint'],
                tasks: ['jshint'],
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
                // tasks: ['concat', 'cssmin','csslint'],
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: {
                src: paths.js,
                options: {
                    jshintrc: true,
                    ignores: paths.jsIgnore
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
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    //Default task(s).
    if (process.env.NODE_ENV === 'production') {
        grunt.registerTask('default', ['concat','cssmin', 'uglify', 'imagemin', 'concurrent']);
    } else {
        grunt.registerTask('default', ['jshint', 'csslint', 'concurrent']);
    }

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
    // For Heroku users only.
    // Docs: https://github.com/linnovate/mean/wiki/Deploying-on-Heroku
    grunt.registerTask('heroku:production', ['cssmin', 'uglify']);
};
