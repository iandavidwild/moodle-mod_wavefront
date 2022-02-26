// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Encapsules the behavior for creating a Wavefront 3D model in Moodle.
 *
 * Manages the UI while operations are occuring, including rendering and manipulating the model.
 *
 * @module     mod_wavefront/model_renderer
 * @class      model_renderer
 * @package    mod_wavefront
 * @copyright  2022 Ian Wild
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      3.9
 */

import WebGL from 'mod_wavefront/WebGL';
import * as THREE from 'mod_wavefront/three';
import { MTLLoader } from 'mod_wavefront/MTLLoader';
import { OBJLoader } from 'mod_wavefront/OBJLoader';
import { OrbitControls } from 'mod_wavefront/OrbitControls';
import jQuery from 'jquery';

var cameras = [], controls_array = [], scenes = [], renderers = [];

var containers = [];
var stage_widths = [], stage_heights = []; 
var lightings = [], ambients = [], keyLights = [], fillLights = [], backLights = [];

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

const animate = () => {
	 renderers.forEach( function(renderer, i) {
	    renderer.render(scenes[i], cameras[i]);
	 	controls_array[i].update();
	 });
	 
	 requestAnimationFrame(animate);
}

export const init = (stages) => {

	if (!WebGL.isWebGLAvailable() ) {			
	    const warning = WebGL.getWebGLErrorMessage();
		document.getElementById( 'container' ).appendChild( warning );
	    return true;
	}
	
	console.log(stages);
	
    stages.forEach(function(stage) {
        
    	var container = document.getElementById(stage);
    	console.log(container);
		containers.push(container);
		
		// Get stage attributes
		var stage_width = jQuery(container).attr("data-stagewidth");
		console.log(stage_width);
		stage_widths.push(stage_width);
		var stage_height = jQuery(container).attr("data-stageheight");
		console.log(stage_height);
	    stage_heights.push(stage_height);
		
		// Get camera attributes
		var cameraangle = jQuery(container).attr("data-cameraangle");
	    console.log(cameraangle);
		var camerafar = jQuery(container).attr("data-camerafar");
		console.log(camerafar);
		var camerax = jQuery(container).attr("data-camerax");
		console.log(camerax);
		var cameray = jQuery(container).attr("data-cameray");
		console.log(cameray);
		var cameraz = jQuery(container).attr("data-cameraz");
		console.log(cameraz);
		
		// Get model files
		var mtl = jQuery(container).attr("data-mtl");
		console.log(mtl);
		var mtl_file = decodeURIComponent(mtl);
		console.log(mtl_file);
		var obj = jQuery(container).attr("data-obj");
		console.log(obj);
		var obj_file = decodeURIComponent(obj);
		console.log(obj_file);
		
		/* Load model */
		var mtlLoader = new MTLLoader();
	    mtlLoader.load(mtl_file, (materials) => {
	
	        materials.preload();
	
	        var objLoader = new OBJLoader();
	        objLoader.setMaterials(materials);
	        objLoader.load(obj_file, function (object) {
	        
	        	// Create scene
				var scene = new THREE.Scene();
				scenes.push(scene);
				
				// Camera
				var SCREEN_WIDTH = stage_width, SCREEN_HEIGHT = stage_height;
				var VIEW_ANGLE = Number(cameraangle), ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = Number(camerafar);
				var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
				cameras.push(camera);
				scene.add(camera);
				camera.position.set(Number(camerax),Number(cameray),Number(cameraz));	
			
				var ambient = new THREE.AmbientLight(0xffffff, 1.0);
				ambients.push(ambient);	
				scene.add(ambient);
				// Lighting
				var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
				keyLights.push(keyLight);
				keyLight.position.set(-100, 0, 100);
			
				var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
				fillLights.push(fillLight);
				fillLight.position.set(100, 0, 100);
			
				var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
				backLights.push(backLight);
				backLight.position.set(100, 0, -100).normalize();
			
				scene.add(keyLight);
				scene.add(fillLight);
				scene.add(backLight);
	            scene.add(object);
	
				/* Renderer */
	    
			    var renderer = new THREE.WebGLRenderer();
			    renderer.setPixelRatio(window.devicePixelRatio);
			    renderer.setSize(stage_width, stage_height);
			    renderer.setClearColor(new THREE.Color("hsl(0, 0%, 10%)"));
			    renderers.push(renderer);
			    container.appendChild(renderer.domElement);
			                
	            /* Controls */
	
			    var controls = new OrbitControls(camera, renderer.domElement);
			    controls.enableDamping = true;
			    controls.dampingFactor = 0.25;
			    controls_array.push(controls);
			     
			    /* Events */
			  
			    window.addEventListener('keydown', function (e) {
			    	e.stopPropagation();
			    	if (e.code === 'KeyL') {
			            lighting = !lighting;
			            if (lighting) {
			                ambient.intensity = 0.25;
			                scene.add(keyLight);
			                scene.add(fillLight);
			                scene.add(backLight);
			            } else {
			                ambient.intensity = 1.0;
			                scene.remove(keyLight);
			                scene.remove(fillLight);
			                scene.remove(backLight);
			            }
			        }	
			    }, false);
			
			    /* Start animation */
				animate();
	            
	        });
	    }); 
	});
};