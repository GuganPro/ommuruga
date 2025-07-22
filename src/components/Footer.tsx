export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Om Muruga Enterprises. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
