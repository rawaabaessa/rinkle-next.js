import Image from "next/image";
import styles from "./product-showcase.module.css";

const productImage = (time: string) =>
  `/images/products/ChatGPT Image Oct 3, 2026, ${time} PM.png`;

const columns = [
  ["06_07_22", "06_05_31", "06_18_51"],
  ["06_23_31", "06_27_36", "06_07_22"],
  ["06_18_51", "06_27_18", "06_23_31"],
];

export function ProductShowcase() {
  return (
    <div className={styles.showcase}>
      <input
        id="hero-motion"
        type="checkbox"
        className={styles.pause}
        aria-label="إيقاف حركة المنتجات"
      />
      <label htmlFor="hero-motion" className={styles.motionControl}>
        <span className={styles.pauseLabel}>إيقاف الحركة</span>
        <span className={styles.playLabel}>تشغيل الحركة</span>
      </label>
      <div
        className={styles.viewport}
        role="img"
        aria-label="تشكيلة رينكل من الكوكيز وكيك الشوكولاتة وبوكسات الكوكيز وصواني ورق العنب"
      >
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.columns} aria-hidden="true" dir="ltr">
          {columns.map((products, columnIndex) => (
            <div className={styles.column} key={columnIndex}>
              <div className={styles.track}>
                {/* Equal groups include their trailing spacing, so -50% is
                    exactly one complete sequence at every breakpoint. */}
                {[0, 1].map((copy) => (
                  <div className={styles.group} key={copy}>
                    {products.map((product, productIndex) => (
                      <div className={styles.product} key={product}>
                        <Image
                          src={productImage(product)}
                          alt=""
                          fill
                          sizes="(max-width: 500px) 43vw, (max-width: 800px) 210px, 17vw"
                          className={styles.image}
                          loading="eager"
                          fetchPriority={
                            copy === 0 && productIndex === 0 ? "high" : "auto"
                          }
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
