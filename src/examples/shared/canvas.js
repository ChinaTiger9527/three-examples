import * as THREE from 'three';

function getCanvasViewportSize(canvas) {
  const rect = canvas.getBoundingClientRect();
  const parent = canvas.parentElement;
  const width = Math.max(
    1,
    Math.round(
      canvas.clientWidth || rect.width || parent?.clientWidth || window.innerWidth,
    ),
  );
  const height = Math.max(
    1,
    Math.round(
      canvas.clientHeight ||
        rect.height ||
        parent?.clientHeight ||
        window.innerHeight,
    ),
  );

  return { width, height };
}

export function syncCanvasSize(renderer, camera, canvas, sceneSize) {
  const { width, height } = getCanvasViewportSize(canvas);

  sceneSize.width = width;
  sceneSize.height = height;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

export function watchCanvasSize(renderer, camera, canvas, sceneSize) {
  const handleResize = () => {
    syncCanvasSize(renderer, camera, canvas, sceneSize);
  };

  const resizeObserver =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          handleResize();
        })
      : null;

  if (resizeObserver) {
    resizeObserver.observe(canvas);

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  window.visualViewport?.addEventListener('resize', handleResize);

  handleResize();

  return () => {
    resizeObserver?.disconnect();
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    window.visualViewport?.removeEventListener('resize', handleResize);
  };
}

export function setControlsTarget(controls, objects) {
  const targets = Array.isArray(objects) ? objects : [objects];
  const box = new THREE.Box3();

  targets.forEach((target) => {
    if (target) {
      box.expandByObject(target);
    }
  });

  if (box.isEmpty()) {
    return null;
  }

  const center = box.getCenter(new THREE.Vector3());
  controls.target.copy(center);
  controls.update();

  return center;
}
