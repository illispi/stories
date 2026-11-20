/**
 * Full-screen confetti burst, drawn on a temporary canvas (no dependency). Skipped when the
 * user prefers reduced motion. The canvas ignores clicks and removes itself when done.
 */
const COLORS = ["#c026d3", "#3b82f6", "#f59e0b", "#16a34a", "#ec4899", "#93c5fd", "#fde047"];
const DURATION_MS = 3500;

type Piece = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	w: number;
	h: number;
	angle: number;
	spin: number;
	tilt: number;
	color: string;
	shape: "rect" | "circle";
};

export function confetti() {
	if (typeof window === "undefined") return;
	if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const canvas = document.createElement("canvas");
	canvas.setAttribute("aria-hidden", "true");
	Object.assign(canvas.style, {
		position: "fixed",
		inset: "0",
		width: "100vw",
		height: "100vh",
		pointerEvents: "none",
		zIndex: "60",
	});
	document.body.append(canvas);
	const ctx = canvas.getContext("2d");
	if (!ctx) return canvas.remove();

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const resize = () => {
		canvas.width = innerWidth * dpr;
		canvas.height = innerHeight * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};
	resize();
	addEventListener("resize", resize);

	const W = innerWidth;
	const H = innerHeight;
	const count = Math.round(Math.min(260, Math.max(120, W / 5)));
	const rand = (a: number, b: number) => a + Math.random() * (b - a);

	// Two cannons in the bottom corners, aimed up and inwards, plus a light rain from the top
	const pieces: Piece[] = Array.from({ length: count }, (_, i) => {
		const kind = i % 5;
		const fromLeft = kind < 2;
		const fromTop = kind === 4;
		const speed = rand(11, 19);
		const aim = fromLeft ? rand(-75, -50) : rand(-130, -105); // degrees, up = -90
		return {
			x: fromTop ? rand(0, W) : fromLeft ? rand(-10, 30) : rand(W - 30, W + 10),
			y: fromTop ? rand(-H * 0.3, -10) : H + 10,
			vx: fromTop ? rand(-1.5, 1.5) : Math.cos((aim * Math.PI) / 180) * speed,
			vy: fromTop ? rand(1, 3) : Math.sin((aim * Math.PI) / 180) * speed * (H / 800 > 1 ? 1.15 : 1),
			w: rand(6, 11),
			h: rand(8, 15),
			angle: rand(0, Math.PI * 2),
			spin: rand(-0.25, 0.25),
			tilt: rand(0, Math.PI * 2),
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
			shape: Math.random() < 0.2 ? "circle" : "rect",
		};
	});

	const start = performance.now();
	let last = start;
	const frame = (now: number) => {
		const dt = Math.min((now - last) / 16.7, 3); // frames at 60 fps, capped after tab switches
		last = now;
		const elapsed = now - start;
		ctx.clearRect(0, 0, W, H);
		const fade = elapsed > DURATION_MS - 800 ? Math.max(0, (DURATION_MS - elapsed) / 800) : 1;
		ctx.globalAlpha = fade;

		for (const p of pieces) {
			p.vy += 0.32 * dt; // gravity
			p.vx *= 0.99 ** dt; // air drag
			p.vy *= 0.99 ** dt;
			p.x += p.vx * dt + Math.sin(p.tilt) * 0.6;
			p.y += p.vy * dt;
			p.angle += p.spin * dt;
			p.tilt += 0.08 * dt;

			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.angle);
			ctx.scale(1, Math.cos(p.tilt)); // flutter
			ctx.fillStyle = p.color;
			if (p.shape === "circle") {
				ctx.beginPath();
				ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
				ctx.fill();
			} else {
				ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
			}
			ctx.restore();
		}

		if (elapsed < DURATION_MS) requestAnimationFrame(frame);
		else {
			removeEventListener("resize", resize);
			canvas.remove();
		}
	};
	requestAnimationFrame(frame);
}
