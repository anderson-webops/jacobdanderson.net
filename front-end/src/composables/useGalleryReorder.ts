import type { Ref } from "vue";
import type { GalleryItem } from "~/utils/gallery";
import { onBeforeUnmount, ref, shallowRef } from "vue";

type Placement = "before" | "after";
interface Spot {
	targetId: string;
	placement: Placement;
}

export function useGalleryReorder(
	list: Ref<HTMLUListElement | undefined>,
	items: Ref<GalleryItem[]>,
	unavailable: () => boolean,
	save: (item: GalleryItem, spot: Spot) => void
) {
	const picked = ref("");
	const spot = shallowRef<Spot>();
	const ghost = shallowRef<{ left: number; top: number }>();
	let gesture:
		| { id: number; item: GalleryItem; handle: HTMLElement; startX: number; startY: number; x: number; y: number }
		| undefined;
	let frame = 0;
	let suppressClick = false;

	function compatible(target: GalleryItem) {
		const source = items.value.find(item => item.id === picked.value);
		return Boolean(source && Boolean(source.favorite) === Boolean(target.favorite));
	}
	function reset() {
		const current = gesture;
		gesture = undefined;
		if (current?.handle.hasPointerCapture?.(current.id)) current.handle.releasePointerCapture(current.id);
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		picked.value = "";
		spot.value = undefined;
		ghost.value = undefined;
	}
	function drop(destination?: Spot) {
		const source = items.value.find(item => item.id === picked.value);
		const target = items.value.find(item => item.id === destination?.targetId);
		const valid = source && target && source !== target && compatible(target) && !unavailable();
		reset();
		if (valid && destination) {
			const index = items.value.indexOf(target);
			if (items.value[index + (destination.placement === "before" ? -1 : 1)] !== source)
				save(source, destination);
		}
	}
	function choose(item: GalleryItem, event: MouseEvent) {
		if (event.detail && suppressClick) return;
		if (unavailable()) return;
		if (picked.value === item.id) return reset();
		if (!picked.value) {
			picked.value = item.id;
			return;
		}
		if (compatible(item)) {
			drop({
				targetId: item.id,
				placement:
					items.value.findIndex(image => image.id === picked.value) < items.value.indexOf(item)
						? "after"
						: "before"
			});
		}
	}
	function pointAt(x: number, y: number) {
		const grid = list.value;
		const hit = document.elementFromPoint(x, y);
		if (!grid || !hit || !grid.contains(hit)) return;
		let card = hit.closest<HTMLElement>("[data-item]");
		if (!card) {
			let nearest = Infinity;
			for (const element of grid.querySelectorAll<HTMLElement>("[data-item]")) {
				const box = element.getBoundingClientRect();
				const distance =
					Math.max(box.left - x, 0, x - box.right) ** 2 + Math.max(box.top - y, 0, y - box.bottom) ** 2;
				if (distance < nearest) {
					nearest = distance;
					card = element;
				}
			}
		}
		const target = items.value.find(item => item.id === card?.dataset.item);
		if (!card || !target || target.id === picked.value || !compatible(target)) return;
		const box = card.getBoundingClientRect();
		const before = box.width >= grid.clientWidth - 2 ? y < box.top + box.height / 2 : x < box.left + box.width / 2;
		return { targetId: target.id, placement: before ? "before" : "after" } as Spot;
	}
	function track() {
		if (!gesture) return;
		const { x, y } = gesture;
		const edge = 64;
		const speed = y < edge ? -Math.min(edge, edge - y) : Math.max(0, Math.min(edge, y - window.innerHeight + edge));
		if (speed) window.scrollBy({ top: Math.sign(speed) * Math.ceil(Math.abs(speed) / 4), behavior: "instant" });
		ghost.value = { left: x, top: y };
		spot.value = pointAt(x, y);
		frame = requestAnimationFrame(track);
	}
	function down(event: PointerEvent, item: GalleryItem) {
		suppressClick = false;
		if (unavailable() || gesture || !event.isPrimary || event.button !== 0) return;
		if (event.pointerType === "touch" && !(event.target as Element).closest(".grip")) return;
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);
		gesture = {
			id: event.pointerId,
			item,
			handle,
			startX: event.clientX,
			startY: event.clientY,
			x: event.clientX,
			y: event.clientY
		};
	}
	function move(event: PointerEvent) {
		if (gesture?.id !== event.pointerId) return;
		gesture.x = event.clientX;
		gesture.y = event.clientY;
		if (!ghost.value && Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY) >= 6) {
			picked.value = gesture.item.id;
			suppressClick = true;
			track();
		}
	}
	function up(event: PointerEvent) {
		if (gesture?.id !== event.pointerId) return;
		if (ghost.value) drop(pointAt(event.clientX, event.clientY));
		else gesture = undefined;
	}
	function cancelPointer(event: PointerEvent) {
		if (gesture?.id === event.pointerId) reset();
	}
	function key(event: KeyboardEvent, item: GalleryItem) {
		if (!picked.value) return;
		const group = items.value.filter(compatible);
		const index = group.indexOf(item);
		const offsets: Record<string, number> = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -1,
			ArrowDown: 1,
			Home: -group.length,
			End: group.length
		};
		const offset = offsets[event.key];
		if (offset === undefined) return;
		event.preventDefault();
		const target = group[Math.max(0, Math.min(group.length - 1, index + offset))];
		list.value?.querySelector<HTMLButtonElement>(`[data-item="${target?.id}"] .reorder`)?.focus();
	}
	onBeforeUnmount(reset);
	return { picked, spot, ghost, compatible, reset, choose, down, move, up, cancelPointer, key };
}
