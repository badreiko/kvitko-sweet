import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllProducts, updateProduct } from '@/firebase/services/productService';
import { slugify } from '@/utils/slugify';
import { toast } from 'sonner';

export default function SlugMigration() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');

    const handleMigration = async () => {
        setLoading(true);
        setProgress('Starting migration...');

        try {
            const products = await getAllProducts();
            setProgress(`Found ${products.length} products. Processing...`);

            let updatedCount = 0;

            for (const product of products) {
                if (!product.slug) {
                    const slug = slugify(product.name);
                    await updateProduct(product.id, { slug });
                    updatedCount++;
                    setProgress(`Updated: ${product.name} -> ${slug}`);
                }
            }

            setProgress(`Migration complete! Updated ${updatedCount} products.`);
            toast.success(`Successfully updated ${updatedCount} products with slugs.`);
        } catch (error) {
            console.error('Migration error:', error);
            setProgress('Error occurred during migration. Check console.');
            toast.error('Migration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Product Slug Migration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p>This tool will generate slugs for all products that don't have one.</p>
                        <div className="bg-muted p-4 rounded-md font-mono text-sm min-h-[100px]">
                            {progress || 'Ready to start'}
                        </div>
                        <Button onClick={handleMigration} disabled={loading}>
                            {loading ? 'Migrating...' : 'Start Migration'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
