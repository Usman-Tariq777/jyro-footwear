import { useState, useMemo, useEffect, useRef } from "react";
import { SHOP, PRODUCTS, REVIEWS } from "./products.js";
import { supabase } from "./supabase.js";
import Admin from "./Admin.jsx";

const wa = (t) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(t)}`;
const rs = (n) => "Rs " + n.toLocaleString("en-PK");
const off = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv ${on ? "in" : ""} ${className}`} style={{ transitionDelay: delay + "ms" }}>{children}</div>;
}

function Count({ to, suffix = "" }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => { const k = Math.min((t - t0) / 1400, 1); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); k < 1 && requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

function Tilt({ children, className }) {
  const ref = useRef(null);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
  };
  const leave = () => (ref.current.style.transform = "");
  return <div ref={ref} className={className} onMouseMove={move} onMouseLeave={leave}>{children}</div>;
}

export default function App() {
  return window.location.pathname.startsWith("/admin") ? <Admin /> : <Shop />;
}

function Shop() {
  const [products, setProducts] = useState(supabase ? [] : PRODUCTS);
  const [reviews, setReviews] = useState(supabase ? [] : REVIEWS);
  useEffect(() => {
    if (!supabase) return;
    supabase.from("products").select("*").eq("visible", true).order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) return setProducts(PRODUCTS);
        setProducts(data.map((r) => ({ id: r.id, name: r.name, category: r.category || "Shoes", price: r.price, oldPrice: r.old_price || null, tag: r.tag, image: r.image_url, description: r.description || "", sizes: r.sizes || [], colors: r.colors || "", soldOut: r.sold_out })));
      });
    supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) return setReviews(REVIEWS);
        setReviews(data.map((r) => ({ name: r.name, city: r.city, text: r.text, rating: r.rating })));
      });
  }, []);
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);
  const [size, setSize] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", city: "", rating: 5, text: "" });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const list = useMemo(() => products.filter((p) => cat === "All" || p.category === cat), [cat, products]);
  const view = (p) => { setOpen(p); setSize(null); };

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const order = (p, s) => wa(`Hello ${SHOP.name}! I want to order:\n${p.name} (${p.colors})\nSize: ${s || "not selected"}\nPrice: ${rs(p.price)}\nPlease confirm availability.`);
  const ticker = ["Free delivery in Lahore", "Cash on delivery", "Easy size exchange", "Order on WhatsApp", "Limited stock"];

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) return;
    
    if (supabase) {
      await supabase.from("reviews").insert({
        name: reviewForm.name,
        city: reviewForm.city,
        rating: reviewForm.rating,
        text: reviewForm.text,
        approved: false
      });
    }
    
    setReviewSubmitted(true);
    setReviewForm({ name: "", city: "", rating: 5, text: "" });
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewOpen(false);
    }, 3000);
  };

  return (
    <>
      <div className="promo"><div className="promo-track">{[...ticker, ...ticker, ...ticker].map((t, i) => <span key={i}>{t}</span>)}</div></div>
      <header className={scrolled ? "nav solid" : "nav"}>
        <a className="logo" href="#top"><img src="/images/logo.png" alt="Jyro Footwear logo" /><span>Jyro<b>.</b> <small>Footwear</small></span></a>
        <nav>
          <a href="#shoes">Shoes</a><a href="#how">How to order</a><a href="#about">About</a>
          <a className="btn small" href={wa(`Hello ${SHOP.name}!`)} target="_blank" rel="noreferrer">WhatsApp us</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="orb o1" /><div className="orb o2" />
        <div className="hero-text">
          <p className="pill">Direct from {SHOP.city} · Cash on delivery</p>
          <h1><span>Walk</span><span>in style.</span></h1>
          <p className="sub">{SHOP.tagline} Pick your pair, choose your size and order on WhatsApp in one tap.</p>
          <div className="cta">
            <a className="btn" href="#shoes">Shop now</a>
            <a className="btn ghost" href={`tel:${SHOP.whatsapp.replace("92", "+92")}`}>Call {SHOP.phoneShow}</a>
          </div>
        </div>
        <Tilt className="hero-img">
          <div className="ring" />
          <img src="/images/logo.png" alt="Jyro Footwear" />
          <div className="float-tag t1">New collection</div>

        </Tilt>
      </section>

      <section className="stats">
        <Reveal><strong><Count to={5000} suffix="+" /></strong><span>Happy customers</span></Reveal>
        <Reveal delay={100}><strong><Count to={120} suffix="+" /></strong><span>Shoe designs</span></Reveal>
        <Reveal delay={200}><strong><Count to={36} /></strong><span>Cities delivered</span></Reveal>
        <Reveal delay={300}><strong><Count to={4} suffix=".9★" /></strong><span>Customer rating</span></Reveal>
      </section>

      <section className="shoes" id="shoes">
        <Reveal><h2>Pick your pair</h2><p className="lead">Tap any shoe to see sizes and order.</p></Reveal>
        <div className="filters">{cats.map((c) => <button key={c} className={c === cat ? "chip on" : "chip"} onClick={() => setCat(c)}>{c}</button>)}</div>
        {!list.length && <p className="lead">New shoes coming soon. Message us on WhatsApp!</p>}
        <div className="grid">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <Tilt className="card">
                <div className="pic" onClick={() => view(p)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && view(p)}>
                  <img src={p.image} alt={p.name} loading="lazy" />
                  {p.soldOut ? <span className="badge">Sold out</span> : p.tag && <span className="badge">{p.tag}</span>}
                  {off(p) > 0 && <span className="off">-{off(p)}%</span>}
                </div>
                <div className="info">
                  <div><h3>{p.name}</h3><span>{p.category} · {p.colors}</span></div>
                  <div className="pr"><strong>{rs(p.price)}</strong>{p.oldPrice && <s>{rs(p.oldPrice)}</s>}</div>
                </div>
                <div className="row">
                  <button className="btn small ghost" onClick={() => view(p)}>Choose size</button>
                  {p.soldOut ? <span className="btn small ghost dis">Sold out</span> : <a className="btn small" href={order(p)} target="_blank" rel="noreferrer">Order now</a>}
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <Reveal><h2>Order in 3 easy steps</h2></Reveal>
        <div className="steps">
          {[["Choose", "Pick the shoe and size you like."], ["Send on WhatsApp", "Tap order. Your message is ready, just press send."], ["Get it home", "We confirm and deliver. Pay cash when it arrives."]].map(([t, d], i) => (
            <Reveal key={t} delay={i * 120} className="step"><i>{i + 1}</i><h3>{t}</h3><p>{d}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="about" id="about">
        <Reveal className="about-in">
          <div className="avatar">JI</div>
          <div>
            <h2>Made by people who love shoes</h2>
            <p>Jyro Footwear is a Lahore brand built on one idea: good shoes should be comfortable, look great and cost fair. Every pair is checked before it leaves us.</p>
            <p className="ceo"><b>{SHOP.ceo}</b>, Founder &amp; CEO</p>
          </div>
        </Reveal>
      </section>

      <section className="reviews">
        <Reveal><h2>What customers say</h2></Reveal>
        <div className="rgrid">{reviews.map((r, i) => (
          <Reveal key={r.name + i} delay={i * 120} className="review">
            <div className="stars">{"★".repeat(r.rating || 5)}{"☆".repeat(5 - (r.rating || 5))}</div>
            <p>{r.text}</p>
            <b>{r.name}</b><span>{r.city}</span>
          </Reveal>
        ))}</div>
        <Reveal className="review-cta">
          <button className="btn ghost" onClick={() => setReviewOpen(true)}>Write a review</button>
        </Reveal>
      </section>

      <section className="contact" id="contact">
        <Reveal>
          <h2>Ready for your new pair?</h2>
          <p>Message {SHOP.ceo} and team on WhatsApp. We reply fast.</p>
          <a className="btn big" href={wa(`Hello ${SHOP.name}! I want to buy shoes.`)} target="_blank" rel="noreferrer">Chat on WhatsApp · {SHOP.phoneShow}</a>
        </Reveal>
      </section>

      <footer>© {new Date().getFullYear()} {SHOP.name}, {SHOP.city} · {SHOP.phoneShow}</footer>

      <a className="wa-float" href={wa(`Hello ${SHOP.name}!`)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><span>Order here</span>💬</a>

      {open && (
        <div className="overlay" onClick={() => setOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="close" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <div className="m-pic"><img src={open.image} alt={open.name} /></div>
            <div className="m-info">
              <span className="tag">{open.category}</span>
              <h3>{open.name}</h3>
              <div className="pr big"><strong>{open.price === 0 ? "Price on request" : rs(open.price)}</strong>{open.oldPrice && open.price !== 0 && <s>{rs(open.oldPrice)}</s>}</div>
              <p>{open.description}</p>
              <p className="meta">Colour: {open.colors}</p>
              <p className="meta">Choose size</p>
              <div className="sizes">{open.sizes.map((s) => <button key={s} className={s === size ? "size on" : "size"} onClick={() => setSize(s)}>{s}</button>)}</div>
              {open.soldOut || open.price === 0 ? <span className="btn full ghost dis">Sold out</span> : <a className="btn full" href={order(open, size)} target="_blank" rel="noreferrer">Order on WhatsApp</a>}
              <p className="meta small">Cash on delivery · Easy size exchange</p>
            </div>
          </div>
        </div>
      )}

      {reviewOpen && (
        <div className="overlay" onClick={() => setReviewOpen(false)}>
          <div className="modal review-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="close" onClick={() => setReviewOpen(false)} aria-label="Close">×</button>
            <div className="m-info">
              <h3>Write a review</h3>
              {reviewSubmitted ? (
                <div className="review-success">
                  <p>Thank you for your review! It will be visible after approval.</p>
                </div>
              ) : (
                <form onSubmit={submitReview}>
                  <label className="meta">Your name *</label>
                  <input type="text" value={reviewForm.name} onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})} placeholder="Enter your name" required />
                  
                  <label className="meta">City (optional)</label>
                  <input type="text" value={reviewForm.city} onChange={(e) => setReviewForm({...reviewForm, city: e.target.value})} placeholder="Your city" />
                  
                  <label className="meta">Rating *</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= reviewForm.rating ? "filled" : ""}`}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  
                  <label className="meta">Your review *</label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                    placeholder="Share your experience with our shoes..."
                    rows="4"
                    required
                  />
                  
                  <button type="submit" className="btn full">Submit review</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
