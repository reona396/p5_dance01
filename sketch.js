// dance video :
// AIST Dance Video Database
// https://aistdancedb.ongaaccel.jp/

let video;
let poseNet;
let poses = [];

let particles = [];
let e = new p5.Ease();
let ox, oy;
let colors = [];
const canvasScale = 0.5;
let clicked = false;

function setup() {
	createCanvas(960, 540);

	// noCursor();
	video = createVideo("Assets/video02.mp4", videoLoaded);

	poseNet = ml5.poseNet(video, modelReady);
	poseNet.on('pose', function (results) {
		poses = results;
	});
	video.hide();

	colors[0] = color(255, 0, 255, 120);
	colors[1] = color(255, 255, 0, 120);
	colors[2] = color(0, 255, 255, 120);

	strokeWeight(2);
	angleMode(DEGREES);
	strokeJoin(ROUND);
	textAlign(CENTER, CENTER);
	textSize(100);
}

function videoLoaded() {
	video.size(960, 540);
}

function modelReady() {
	// select('#status').html('Model Loaded');
}

function draw() {
	background(230);

	if (!clicked) {
		text("CLICK TO PLAY", width / 2, height / 2);
	}

	image(video, 0, 0, width, height);

	drawParticles();

	for (let i = 0; i < particles.length; i++) {
		particles[i].display();
	}

	for (let j = 0; j < particles.length; j++) {
		if (particles[j].isFinished) {
			particles.splice(j, 1);
		}
	}
}

function mousePressed() {
	if (!clicked) {
		video.loop();
		clicked = true;
	}
}

function drawParticles() {
	for (let i = 0; i < poses.length; i++) {
		let pose = poses[i].pose;
		for (let j = 0; j < pose.keypoints.length; j++) {
			let keypoint = pose.keypoints[j];

			if (frameCount % 2 == 0 && (keypoint.part === "rightWrist" || keypoint.part === "leftWrist") && keypoint.score > 0.15) {
				let targetX = keypoint.position.x;
				let targetY = keypoint.position.y;

				let randomTheta = random(360);
				let randomR = 1; //random(5);

				let X = targetX + randomR * cos(randomTheta);
				let Y = targetY + randomR * sin(randomTheta);

				// let dis = dist(targetX, targetY, X, Y);
				let C = floor(random(3));
				let Rmax = random(3, 6); //dis > 15 ? (55 - dis) : random(10, 20);

				particles.push(new Particle(X, Y, C, Rmax));
			}
		}
	}
}

function Particle(tmpX, tmpY, tmpC, tmpRmax) {
	this.pos = createVector(tmpX, tmpY);
	this.rMax = tmpRmax;
	this.theta = random(360);
	this.thetaSpeed = random(-2, 2);
	this.r = 0;
	this.delta = 0;
	this.speed = 1 * 1.5 / 30;
	this.life = this.rMax * 2;
	this.isDeg = false;
	this.isFinished = false;
	this.colorIndex = tmpC;
	this.ySpeed = random(0.5, 3);
	this.isFill = random(10) >= 5 ? true : false;
	this.xNoise = random(1.0);

	this.display = function () {
		if (!this.isDeg) {
			this.r = this.rMax * e.circularOut(this.delta);

			this.delta += this.speed;
			if (this.delta > 1.0) {
				this.delta = 1.0;
				this.isDeg = true;
			}
		} else {
			this.r = this.rMax * e.circularOut(this.delta);

			this.delta -= this.speed * 1.5;
			if (this.delta < 0.0) {
				this.delta = 0.0;
				this.isFinished = true;
			}
		}

		fill(colors[this.colorIndex]);
		noStroke();

		this.pos.x = tmpX + map(noise(this.xNoise), 0, 1, -50, 50);

		if (this.isFill) {
			fill(colors[this.colorIndex]);
			noStroke();
		} else {
			noFill();
			stroke(colors[this.colorIndex]);
		}

		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.theta);
		beginShape();
		for (let i = 0; i < 3; i++) {
			vertex(this.r * cos(i * 360 / 3), this.r * sin(i * 360 / 3))
		}
		endShape(CLOSE);
		pop();

		this.theta += this.thetaSpeed;
		this.pos.y -= this.ySpeed;
		this.xNoise += 0.01;
	}
}