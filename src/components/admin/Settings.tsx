import { FC, useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Save, Globe, CreditCard, Bell, RefreshCw, Clock, Map, Image, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";
import { compressImage, formatFileSize } from "@/utils/imageCompression";
import {
  getSiteSettings,
  updateSiteSettings,
  SiteSettings,
  defaultSettings,
  SectionImages
} from "@/firebase/services/settingsService";

const Settings: FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const fileInputRefs = {
    deliverySection: useRef<HTMLInputElement>(null),
    customBouquet: useRef<HTMLInputElement>(null),
    heroSection: useRef<HTMLInputElement>(null)
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Ошибка при загрузке настроек");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleOpeningHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [name]: value
      }
    }));
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("Настройки успешно сохранены");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Ошибка при сохранении настроек");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (sectionKey: keyof SectionImages, file: File) => {
    setUploadingSection(sectionKey);
    try {
      // Сжимаем изображение
      toast.info("Сжатие изображения...");
      const result = await compressImage(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        quality: 0.85,
        fileType: 'image/webp'
      });
      console.log(`Сжато: ${formatFileSize(result.originalSize)} -> ${formatFileSize(result.compressedSize)}`);

      // Загружаем в Firebase Storage
      const fileName = `${sectionKey}_${Date.now()}.webp`;
      const storageRef = ref(storage, `settings/section-images/${fileName}`);
      await uploadBytes(storageRef, result.file);
      const url = await getDownloadURL(storageRef);

      // Добавляем к массиву изображений
      const currentImages = settings.sectionImages?.[sectionKey] || [];
      const newImages = [...currentImages, url];
      const newSectionImages = { ...settings.sectionImages, [sectionKey]: newImages };
      setSettings(prev => ({ ...prev, sectionImages: newSectionImages }));
      await updateSiteSettings({ sectionImages: newSectionImages });

      toast.success("Изображение добавлено!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Ошибка при загрузке изображения");
    } finally {
      setUploadingSection(null);
    }
  };

  const handleImageDelete = async (sectionKey: keyof SectionImages, imageUrl: string) => {
    try {
      // Удаляем из Storage
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef).catch(() => { });

      // Удаляем из массива
      const currentImages = settings.sectionImages?.[sectionKey] || [];
      const newImages = currentImages.filter(img => img !== imageUrl);
      const newSectionImages = {
        ...settings.sectionImages,
        [sectionKey]: newImages.length > 0 ? newImages : undefined
      };

      // Убираем undefined значения
      if (!newSectionImages[sectionKey]) {
        delete newSectionImages[sectionKey];
      }

      setSettings(prev => ({ ...prev, sectionImages: newSectionImages }));
      await updateSiteSettings({ sectionImages: newSectionImages });

      toast.success("Изображение удалено");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Ошибка при удалении");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
            <p className="text-muted-foreground">Управление настройками сайта и магазина</p>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Сохранение..." : "Сохранить все изменения"}
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-6 w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Основные</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Контакты</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Магазин</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Изображения</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Уведомления</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Интеграции</span>
            </TabsTrigger>
          </TabsList>

          {/* Основные настройки */}
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Основные настройки сайта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Название сайта</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Описание сайта</Label>
                    <Input
                      id="siteDescription"
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance">Режим обслуживания</Label>
                    <p className="text-sm text-muted-foreground">Включите, чтобы временно закрыть доступ к сайту</p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={settings.enableMaintenance}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'enableMaintenance')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Контакты, Время работы, Карта */}
          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Контакты и Местоположение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email для связи</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Телефон для связи</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={settings.contactPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Часы работы
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekdays">Понедельник - Пятница</Label>
                      <Input
                        id="weekdays"
                        name="weekdays"
                        value={settings.openingHours.weekdays}
                        onChange={handleOpeningHoursChange}
                        placeholder="9:00 - 19:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="saturday">Суббота</Label>
                      <Input
                        id="saturday"
                        name="saturday"
                        value={settings.openingHours.saturday}
                        onChange={handleOpeningHoursChange}
                        placeholder="9:00 - 17:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sunday">Воскресенье</Label>
                      <Input
                        id="sunday"
                        name="sunday"
                        value={settings.openingHours.sunday}
                        onChange={handleOpeningHoursChange}
                        placeholder="10:00 - 15:00"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Карта (Embed)
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="mapEmbedUrl">Ссылка для встраивания (src из iframe Google Maps)</Label>
                    <Textarea
                      id="mapEmbedUrl"
                      name="mapEmbedUrl"
                      value={settings.mapEmbedUrl}
                      onChange={handleChange}
                      placeholder="https://www.google.com/maps/embed?..."
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Вставьте ссылку из тега src iframe, который можно получить на Google Maps (Поделиться - Встраивание карт)
                    </p>
                  </div>
                  {settings.mapEmbedUrl && (
                    <div className="mt-4 border rounded-md overflow-hidden aspect-video max-w-xl">
                      <iframe
                        src={settings.mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки магазина */}
          <TabsContent value="shop" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки магазина</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Валюта</Label>
                    <Input
                      id="currency"
                      name="currency"
                      value={settings.currency}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Символ валюты</Label>
                    <Input
                      id="currencySymbol"
                      name="currencySymbol"
                      value={settings.currencySymbol}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Ставка налога (%)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      value={settings.taxRate}
                      onChange={handleNumericChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Минимальная сумма заказа (Kč)</Label>
                    <Input
                      id="minOrderAmount"
                      name="minOrderAmount"
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={handleNumericChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold">Бесплатная доставка от (Kč)</Label>
                    <Input
                      id="freeShippingThreshold"
                      name="freeShippingThreshold"
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={handleNumericChange}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="stockManagement">Управление складскими запасами</Label>
                    <p className="text-sm text-muted-foreground">Отслеживать количество товаров на складе</p>
                  </div>
                  <Switch
                    id="stockManagement"
                    checked={settings.enableStockManagement}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'enableStockManagement')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Заглушки для остальных вкладок */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Раздел в разработке.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Интеграции</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Раздел в разработке.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Изображения секций */}
          <TabsContent value="images" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Изображения секций главной страницы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Вы можете загрузить несколько изображений для каждой секции. Они будут автоматически меняться с плавным переходом.
                </p>

                {/* Delivery Section Images */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Секция доставки (Doručení květin)</Label>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRefs.deliverySection}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('deliverySection', file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.deliverySection.current?.click()}
                        disabled={uploadingSection === 'deliverySection'}
                      >
                        {uploadingSection === 'deliverySection' ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Загрузка...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />Добавить изображение</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(settings.sectionImages?.deliverySection || []).map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Delivery ${index + 1}`}
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageDelete('deliverySection', url)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!settings.sectionImages?.deliverySection || settings.sectionImages.deliverySection.length === 0) && (
                      <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Custom Bouquet Section Images */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Секция "Создай свой букет" (Vytvořte si vlastní kytici)</Label>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRefs.customBouquet}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('customBouquet', file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.customBouquet.current?.click()}
                        disabled={uploadingSection === 'customBouquet'}
                      >
                        {uploadingSection === 'customBouquet' ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Загрузка...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />Добавить изображение</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(settings.sectionImages?.customBouquet || []).map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Custom Bouquet ${index + 1}`}
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageDelete('customBouquet', url)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!settings.sectionImages?.customBouquet || settings.sectionImages.customBouquet.length === 0) && (
                      <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Hero Section Images */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Hero секция (основное изображение вверху)</Label>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRefs.heroSection}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('heroSection', file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.heroSection.current?.click()}
                        disabled={uploadingSection === 'heroSection'}
                      >
                        {uploadingSection === 'heroSection' ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Загрузка...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />Добавить изображение</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(settings.sectionImages?.heroSection || []).map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Hero ${index + 1}`}
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageDelete('heroSection', url)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!settings.sectionImages?.heroSection || settings.sectionImages.heroSection.length === 0) && (
                      <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
