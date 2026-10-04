import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const empty = { name: "", category: "Sneakers", price: "", old_price: "", tag: "", description: "", colors: "", sizes: "40, 41, 42, 43, 44", image_url: "", sold_out: false, visible: true };

// shrink big phone photos before upload (faster website)
const shrink = (file) => new Promise((res) => {
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, 1100 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = img.width * k; c.height = img.height * k;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(res, "image/jpeg", 0.85);
  };
  img.src = URL.createObjectURL(file);
});

export default function Admin() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return setReady(true);
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) setMsg(error.message); else setItems(data);
    const { data: revData, error: revError } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (!revError) setReviews(revData);
  };
  useEffect(() => { if (session) load(); }, [session]);

  if (!ready) return <div className="adm"><p>Loading...</p></div>;
  if (!supabase) return <div className="adm"><div className="abox"><h2>Admin not set up yet</h2><p>Add the Supabase keys in Vercel (see SETUP-ADMIN.txt).</p></div></div>;

  const login = async (e) => {
    e.preventDefault(); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setMsg("Wrong email or password.");
  };

  if (!session) return (
    <div className="adm"><form className="abox" onSubmit={login}>
      <h2>Jyro Admin</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} required />
      <button className="btn full" type="submit">Log in</button>
      {msg && <p className="err">{msg}</p>}
    </form></div>
  );

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setBusy(true); setMsg("Uploading photo...");
    const blob = await shrink(file);
    const path = `${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("shoe-images").upload(path, blob, { contentType: "image/jpeg" });
    if (error) { setMsg(error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("shoe-images").getPublicUrl(path);
    setF((x) => ({ ...x, image_url: data.publicUrl })); setMsg("Photo uploaded."); setBusy(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!f.image_url) return setMsg("Please upload a photo first.");
    setBusy(true);
    const row = {
      name: f.name.trim(), category: f.category.trim() || "Shoes", price: parseInt(f.price, 10),
      old_price: f.old_price ? parseInt(f.old_price, 10) : null, tag: f.tag.trim() || null,
      description: f.description.trim(), colors: f.colors.trim(),
      sizes: f.sizes.split(",").map((s) => parseInt(s, 10)).filter(Boolean),
      image_url: f.image_url, sold_out: f.sold_out, visible: f.visible,
    };
    const { error } = f.id ? await supabase.from("products").update(row).eq("id", f.id) : await supabase.from("products").insert(row);
    setBusy(false);
    if (error) return setMsg(error.message);
    setMsg(f.id ? "Shoe updated." : "Shoe added. It is live now."); setF(empty); load();
  };

  const edit = (p) => { setF({ ...p, old_price: p.old_price ?? "", tag: p.tag ?? "", description: p.description ?? "", colors: p.colors ?? "", sizes: (p.sizes || []).join(", ") }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const quick = async (p, patch) => { await supabase.from("products").update(patch).eq("id", p.id); load(); };
  const del = async (p) => { if (window.confirm(`Delete "${p.name}" forever?`)) { await supabase.from("products").delete().eq("id", p.id); load(); } };
  const deleteReview = async (r) => { if (window.confirm(`Delete review from "${r.name}"?`)) { await supabase.from("reviews").delete().eq("id", r.id); load(); } };

  return (
    <div className="adm">
      <div className="atop"><h2>Jyro Admin</h2><div><a href="/">View website</a> <button className="chip" onClick={() => supabase.auth.signOut()}>Log out</button></div></div>
      <form className="abox wide" onSubmit={save}>
        <h3>{f.id ? "Edit shoe" : "Add new shoe"}</h3>
        <label>Photo<input type="file" accept="image/*" onChange={upload} /></label>
        {f.image_url && <img className="prev" src={f.image_url} alt="preview" />}
        <label>Shoe name<input value={f.name} onChange={set("name")} required /></label>
        <div className="two">
          <label>Price (Rs)<input type="number" min="0" value={f.price} onChange={set("price")} required /></label>
          <label>Old price (optional, for discount)<input type="number" min="0" value={f.old_price} onChange={set("old_price")} /></label>
        </div>
        <div className="two">
          <label>Category (Sneakers, Formal...)<input value={f.category} onChange={set("category")} /></label>
          <label>Tag (New, Hot, Best seller)<input value={f.tag} onChange={set("tag")} /></label>
        </div>
        <label>Sizes (separate with comma)<input value={f.sizes} onChange={set("sizes")} /></label>
        <label>Colours<input value={f.colors} onChange={set("colors")} placeholder="Black / White" /></label>
        <label>Description<textarea rows="3" value={f.description} onChange={set("description")} /></label>
        <label className="chk"><input type="checkbox" checked={f.sold_out} onChange={set("sold_out")} /> Sold out</label>
        <label className="chk"><input type="checkbox" checked={f.visible} onChange={set("visible")} /> Show on website</label>
        <button className="btn full" disabled={busy}>{busy ? "Please wait..." : f.id ? "Save changes" : "Add shoe"}</button>
        {f.id && <button type="button" className="btn full ghost" onClick={() => setF(empty)}>Cancel edit</button>}
        {msg && <p className="err">{msg}</p>}
      </form>
      <h3 className="ah">Your shoes ({items.length})</h3>
      <div className="alist">
        {items.map((p) => (
          <div className="arow" key={p.id}>
            <img src={p.image_url} alt="" />
            <div><b>{p.name}</b><span>Rs {p.price} · {p.category}{p.sold_out ? " · SOLD OUT" : ""}{!p.visible ? " · HIDDEN" : ""}</span></div>
            <div className="abtns">
              <button className="chip" onClick={() => edit(p)}>Edit</button>
              <button className="chip" onClick={() => quick(p, { sold_out: !p.sold_out })}>{p.sold_out ? "In stock" : "Sold out"}</button>
              <button className="chip" onClick={() => quick(p, { visible: !p.visible })}>{p.visible ? "Hide" : "Show"}</button>
              <button className="chip del" onClick={() => del(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <h3 className="ah">Reviews ({reviews.length})</h3>
      <div className="alist">
        {reviews.map((r) => (
          <div className="arow" key={r.id}>
            <div style={{flex: 1, minWidth: 200}}><b>{r.name}</b><span>{r.city || "No city"} · {"★".repeat(r.rating)}</span><span style={{display: "block", marginTop: 4, fontSize: "0.85rem"}}>{r.text}</span></div>
            <div className="abtns">
              <button className="chip del" onClick={() => deleteReview(r)}>Delete</button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="lead">No reviews yet.</p>}
      </div>
    </div>
  );
}
