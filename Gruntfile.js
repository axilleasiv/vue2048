module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		
		concat: {
			css: {
				src: [
					'css_build/*'
				],
				dest: 'build/css/all.css'
			}
		},

		cssmin: {
			css: {
				src: 'build/css/all.css',
				dest: 'css/all.min.css'
			}
		},

		watch: {
			options: { //35729
				livereload: true,
			},
			css: {
				files: ['css/*.css']
			},
			html: {
				files: ['*.html']
			},
			js: {
				files: ['js/*.js'],
			}
		},

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask('default', ['concat', 'cssmin', 'browserify', 'uglify']);

	// define an alias for common tasks
	// grunt.registerTask('myTasks', ['task1', 'task2:target', 'task3']);		

};