import ContactSheet from "@/components/ContactSheet";

const Index = () => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Contact Sheet Creator</h1>
        <p className="text-muted-foreground text-center mb-8">
          Upload up to 9 photos to create a beautiful contact sheet
        </p>
        <ContactSheet />
      </div>
    </div>
  );
};

export default Index;