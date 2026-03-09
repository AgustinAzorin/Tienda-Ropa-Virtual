import { Box3, Group, Object3D, Vector3 } from 'three';
import type { ProductFitAnchor } from './types';

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

function getAnchorMap(anchors: ProductFitAnchor[] | undefined) {
  const map = new Map<string, Vector3>();
  for (const anchor of anchors ?? []) {
    map.set(anchor.anchor_name, new Vector3(toNumber(anchor.x), toNumber(anchor.y), toNumber(anchor.z)));
  }
  return map;
}

function centerOf(object: Object3D) {
  const box = new Box3().setFromObject(object);
  const center = new Vector3();
  box.getCenter(center);
  return center;
}

export function applyFitAnchors(
  clothingRoot: Group,
  mannequinRoot: Object3D,
  anchors?: ProductFitAnchor[],
) {
  const anchorMap = getAnchorMap(anchors);
  const chest = anchorMap.get('chest') ?? anchorMap.get('torso') ?? new Vector3(0, 1.2, 0);

  const mannequinCenter = centerOf(mannequinRoot);
  const clothingCenter = centerOf(clothingRoot);

  const target = mannequinCenter.clone().add(chest);
  const offset = target.sub(clothingCenter);

  clothingRoot.position.add(offset);
}
