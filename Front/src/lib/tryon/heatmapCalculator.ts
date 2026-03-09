import { BufferGeometry, Color } from 'three';

const HOLGADO = new Color('#4A90D9');
const PERFECTO = new Color('#5BBE7A');
const AJUSTADO = new Color('#D4614A');

function lerpColor(a: Color, b: Color, t: number): Color {
  return a.clone().lerp(b, t);
}

function mapDistanceToColor(distance: number): Color {
  if (distance > 0.035) {
    const t = Math.min((distance - 0.035) / 0.06, 1);
    return lerpColor(PERFECTO, HOLGADO, t);
  }

  if (distance < 0.015) {
    const t = Math.min((0.015 - distance) / 0.015, 1);
    return lerpColor(PERFECTO, AJUSTADO, t);
  }

  return PERFECTO.clone();
}

export function buildHeatmapVertexColors(
  clothingGeometry: BufferGeometry,
  mannequinGeometry: BufferGeometry,
): Float32Array {
  const clothingPos = clothingGeometry.getAttribute('position');
  const mannequinPos = mannequinGeometry.getAttribute('position');

  const result = new Float32Array(clothingPos.count * 3);

  // Fast approximation: compare normalized Y slices between body and clothing vertices.
  let mannequinMinY = Infinity;
  let mannequinMaxY = -Infinity;
  for (let i = 0; i < mannequinPos.count; i += 1) {
    const y = mannequinPos.getY(i);
    mannequinMinY = Math.min(mannequinMinY, y);
    mannequinMaxY = Math.max(mannequinMaxY, y);
  }

  const mannequinRangeY = Math.max(mannequinMaxY - mannequinMinY, 0.001);

  for (let i = 0; i < clothingPos.count; i += 1) {
    const y = clothingPos.getY(i);
    const normalizedY = (y - mannequinMinY) / mannequinRangeY;

    const bodyIndex = Math.floor(normalizedY * (mannequinPos.count - 1));
    const bx = mannequinPos.getX(bodyIndex);
    const by = mannequinPos.getY(bodyIndex);
    const bz = mannequinPos.getZ(bodyIndex);

    const cx = clothingPos.getX(i);
    const cy = clothingPos.getY(i);
    const cz = clothingPos.getZ(i);

    const distance = Math.sqrt(
      (cx - bx) * (cx - bx) +
      (cy - by) * (cy - by) +
      (cz - bz) * (cz - bz),
    );

    const color = mapDistanceToColor(distance);
    result[i * 3] = color.r;
    result[i * 3 + 1] = color.g;
    result[i * 3 + 2] = color.b;
  }

  return result;
}

export function pressureLabelFromDistance(distance: number): 'Zona ajustada' | 'Ajuste perfecto' | 'Zona holgada' {
  if (distance < 0.015) return 'Zona ajustada';
  if (distance > 0.035) return 'Zona holgada';
  return 'Ajuste perfecto';
}

export function pressureLabelFromColor(color: Color): 'Zona ajustada' | 'Ajuste perfecto' | 'Zona holgada' {
  const distance = (a: Color, b: Color) => Math.sqrt(
    (a.r - b.r) * (a.r - b.r) +
    (a.g - b.g) * (a.g - b.g) +
    (a.b - b.b) * (a.b - b.b),
  );

  const distanceToTight = distance(color, AJUSTADO);
  const distanceToPerfect = distance(color, PERFECTO);
  const distanceToLoose = distance(color, HOLGADO);

  if (distanceToTight <= distanceToPerfect && distanceToTight <= distanceToLoose) {
    return 'Zona ajustada';
  }

  if (distanceToLoose <= distanceToPerfect && distanceToLoose <= distanceToTight) {
    return 'Zona holgada';
  }

  return 'Ajuste perfecto';
}
