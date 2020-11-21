import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;

import java.io.IOException;

public class FileInputStreamSample
{
  public static void read1() throws IOException{
    FileReader input = new FileReader("./name.txt");
    int n;
    while ((n = input.read()) != -1) {
        System.out.println((char) n);
        System.out.println(n);
    }
  }

  public static void read2() throws IOException{
    FileInputStream input = new FileInputStream("./name.txt");
    int n;
    while ((n = input.read()) != -1) {
        System.out.println(n);
    }
  }

  public static void main(String[] args){
    try {
      System.out.println("Hello1");
      read1();
    }
    catch (IOException e)
    {
        System.out.println("IOException caught: " + e.getMessage());
        System.exit(1);
    }
  }
}