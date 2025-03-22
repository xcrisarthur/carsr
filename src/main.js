import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Buat scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Tambahkan pencahayaan
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5).normalize(); // Posisi lebih tinggi untuk pencahayaan yang lebih baik
scene.add(directionalLight);

// Muat model garasi
const loaderGARAGE = new GLTFLoader();
loaderGARAGE.load('/public/models/garage.glb', (gltf) => {
    scene.add(gltf.scene); // Tambahkan scene dari model GLB
    gltf.scene.position.set(11, 0, 3); // Sesuaikan posisi model
    gltf.scene.scale.set(5, 5, 5); // Sesuaikan skala model jika perlu
}, undefined, (error) => {
    console.error(error);
});

// Muat model mobil
const loaderCar = new GLTFLoader();
let currentCar; // Menyimpan mobil yang sedang ditampilkan
let speed = 0.001; // Kecepatan pergerakan kamera

function loadCar(modelPath) {
    // Hapus mobil yang ada sebelumnya
    if (currentCar) {
        scene.remove(currentCar);
    }

    // Muat model mobil baru
    loaderCar.load(modelPath, (gltf) => {
        currentCar = gltf.scene;
        scene.add(currentCar);

        // Atur posisi berdasarkan model yang dimuat
        if (modelPath.includes('2020_dodge_challenger_srt_super_stock')) {
            currentCar.position.set(3, -0.5, 0); // Posisi untuk Dodge Challenger
            speed = 0.001; // Kecepatan untuk mobil ini
        } else if (modelPath.includes('dodge_srt_tomahawk_x_vision_gran_turismo')) {
            currentCar.position.set(2.5, 0.3, -0.5); // Posisi untuk Tomahawk
            speed = 0.0005; // Kecepatan lebih lambat untuk Tomahawk
        } else if (modelPath.includes('mobil_3')) {
            currentCar.position.set(2, 0, -1); // Posisi untuk mobil 3
            speed = 0.003; // Kecepatan lebih lambat untuk mobil 3
        } else if (modelPath.includes('mobil_4')) {
            currentCar.position.set(1.5, 0, -1.5); // Posisi untuk mobil 4
            speed = 0.004; // Kecepatan lebih lambat untuk mobil 4
        }

        currentCar.scale.set(500, 500, 500); // Sesuaikan skala mobil
    }, undefined, (error) => {
        console.error(error);
    });
}

// Muat mobil pertama secara default
loadCar('/public/models/2020_dodge_challenger_srt_super_stock.glb');

// Definisikan jalur kamera berbentuk kotak
const points = [
  new THREE.Vector3(15, 0, 15),   // Titik 1: Kanan Atas
  new THREE.Vector3(20, 0, -16),  // Titik 2: Kanan Bawah
  new THREE.Vector3(-11, 0, -15), // Titik 3: Kiri Bawah
  new THREE.Vector3(-12, 0, 15),  // Titik 4: Kiri Atas
  new THREE.Vector3(15, 0, 15)    // Kembali ke Titik 1 untuk menutup kotak
];

// Buat jalur yang lebih halus menggunakan CatmullRomCurve3
const curve = new THREE.CatmullRomCurve3(points);
const divisions = 100; // Jumlah titik di sepanjang jalur
const curvePoints = curve.getPoints(divisions); // Ambil titik-titik di sepanjang jalur

// Buat geometri dan material untuk jalur
const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Warna merah untuk jalur
const line = new THREE.Line(geometry, material);
scene.add(line); // Tambahkan jalur ke scene

// Kamera
camera.position.set(10, 10, 15); // Atur posisi kamera

// Inisialisasi OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Aktifkan efek pelunakan
controls.dampingFactor = 0.1; // Faktor pelunakan
controls.screenSpacePanning = false; // Nonaktifkan panning ruang layar
controls.maxPolarAngle = Math.PI / 3; // Batasi sudut vertikal

// Variabel untuk mengontrol animasi kamera
let t = 0; // Parameter untuk posisi di sepanjang jalur

// Fungsi animasi
const animate = function () {
    requestAnimationFrame(animate);

    // Update posisi kamera
    const point = curve.getPoint(t); // Ambil titik berdasarkan t
    camera.position.copy(point);

    // Update t untuk bergerak di sepanjang jalur
    t += speed;
    if (t > 1) t = 0; // Reset t jika sudah mencapai akhir jalur

    controls.update(); // Update kontrol orbit
    renderer.render(scene, camera);
};

// Mulai animasi
animate();

// Responsif
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Ambil semua radio buttons
const radioButtons = document.querySelectorAll('input[name="switch"]');

// Tambahkan event listener untuk setiap radio button
radioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            const selectedCar = radio.value; // Ambil nilai dari radio button yang dipilih
            loadCar(`/public/models/${selectedCar}`); // Muat model berdasarkan pilihan radio button
        }
    });
});